<?php

namespace App\Http\Controllers\Api;

use App\Jobs\ProcessDocumentJob;
use App\Models\ActivityLog;
use App\Models\AiDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AiDocumentController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isAdmin(), 403);

        $request->validate([
            'file' => ['required', 'file', 'max:20480', 'extensions:pdf,docx,xlsx,txt'],
        ], [
            'file.max' => 'A fájl túl nagy (max 20 MB).',
            'file.extensions' => 'Csak PDF, DOCX, XLSX és TXT tölthető fel.',
        ]);

        $tenant = app('tenant');
        $file = $request->file('file');

        $path = $file->store("ai-documents/{$tenant->slug}/{$user->id}", 'local');

        $document = AiDocument::create([
            'user_id' => $user->id,
            'original_name' => $file->getClientOriginalName(),
            'stored_path' => $path,
            'size_bytes' => $file->getSize(),
            'status' => 'pending',
        ]);

        ProcessDocumentJob::dispatch($tenant->slug, $user->id, $document->id);

        ActivityLog::record('ai_document.uploaded', $user, "AI dokumentum feltöltve: {$document->original_name}", [
            'document_id' => $document->id,
            'size_bytes' => $document->size_bytes,
        ]);

        return response()->json([
            'id' => $document->id,
            'original_name' => $document->original_name,
            'status' => $document->status,
            'chunk_count' => $document->chunk_count,
            'size_bytes' => $document->size_bytes,
            'error_message' => $document->error_message,
            'created_at' => optional($document->created_at)->toIso8601String(),
        ], 201);
    }

    public function destroy(Request $request, AiDocument $document)
    {
        $user = $request->user();
        abort_unless($user->isAdmin(), 403);

        $tenant = app('tenant');

        try {
            $query = http_build_query(['tenant_id' => $tenant->slug]);
            Http::withHeaders([
                'X-Internal-Token' => config('services.rag.token'),
            ])->timeout(30)->delete(config('services.rag.url') . "/documents/{$document->id}?{$query}")->throw();
        } catch (\Throwable $e) {
            Log::error('RAG dokumentum törlés sikertelen: ' . $e->getMessage());
            return response()->json(['message' => 'A dokumentum törlése jelenleg nem lehetséges. Próbálja újra később.'], 502);
        }

        Storage::disk('local')->delete($document->stored_path);

        $name = $document->original_name;
        $document->delete();

        ActivityLog::record('ai_document.deleted', $user, "AI dokumentum törölve: {$name}");

        return response()->noContent();
    }
}

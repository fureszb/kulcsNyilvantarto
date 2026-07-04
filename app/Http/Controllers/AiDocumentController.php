<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessDocumentJob;
use App\Models\ActivityLog;
use App\Models\AiDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AiDocumentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        // 'mimes:docx' a MIME-guesser miatt zip/octet-stream-ként dobná el a
        // docx-et, tartalom-sniffelés Windowson megbízhatatlan. A kiterjesztést
        // itt ellenőrizzük; a tartalmat a RAG szolgáltatás parserei validálják
        // (hibás fájl → 'failed' státusz).
        $request->validate([
            'file' => ['required', 'file', 'max:20480', 'extensions:pdf,docx,xlsx,txt'],
        ], [
            'file.max' => 'A fájl túl nagy (max 20 MB).',
            'file.extensions' => 'Csak PDF, DOCX, XLSX és TXT tölthető fel.',
        ]);

        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();
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

        return back()->with('success', 'A dokumentum feldolgozása elindult.');
    }

    public function destroy(AiDocument $document): RedirectResponse
    {
        $user = Auth::guard('tenant')->user();
        abort_unless($document->user_id === $user->id, 403);

        $tenant = app('tenant');

        try {
            // A FastAPI query paramként várja az azonosítókat, nem body-ban
            $query = http_build_query([
                'tenant_id' => $tenant->slug,
                'user_id' => (string) $user->id,
            ]);
            Http::withHeaders([
                'X-Internal-Token' => config('services.rag.token'),
            ])->timeout(30)->delete(config('services.rag.url') . "/documents/{$document->id}?{$query}")->throw();
        } catch (\Throwable $e) {
            Log::error('RAG dokumentum törlés sikertelen: ' . $e->getMessage());
            return back()->with('error', 'A dokumentum törlése jelenleg nem lehetséges. Próbálja újra később.');
        }

        Storage::disk('local')->delete($document->stored_path);

        $name = $document->original_name;
        $document->delete();

        ActivityLog::record('ai_document.deleted', $user, "AI dokumentum törölve: {$name}");

        return back()->with('success', 'Dokumentum törölve.');
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Http\Resources\Api\UserRefResource;
use App\Models\Document;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    use BuildsDocumentResponse;

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Document::with(['signatures', 'attachments'])->latest();

        if (!$user->canManage()) {
            $query->where('created_by_user_id', $user->id);
        }

        if ($request->filled('document_type')) {
            $query->where('document_type', $request->string('document_type'));
        }
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->integer('location_id'));
        }

        $documents = $query->paginate(25);

        return response()->json(
            collect($documents->items())->map(fn (Document $d) => $this->documentBase($d))->values()
        );
    }

    public function show(Request $request, Document $document)
    {
        $this->authorizeView($request, $document);
        $document->load(['signatures', 'attachments']);

        return response()->json($this->documentBase($document));
    }

    public function destroy(Request $request, Document $document)
    {
        abort_unless($request->user()->isAdmin(), 403);

        if ($document->pdf_path) {
            Storage::disk('local')->delete($document->pdf_path);
        }

        $document->delete();

        return response()->noContent();
    }

    public function workers(Request $request)
    {
        return UserRefResource::collection(
            TenantUser::where('is_active', true)->orderBy('name')->get(['id', 'name'])
        );
    }

    public function pdf(Request $request, Document $document)
    {
        $this->authorizeView($request, $document);
        abort_unless($document->pdf_path && Storage::disk('local')->exists($document->pdf_path), 404);

        return Storage::disk('local')->response($document->pdf_path, null, ['Content-Disposition' => 'inline']);
    }

    private function authorizeView(Request $request, Document $document): void
    {
        $user = $request->user();

        abort_if(
            !$user->canManage() && $user->id !== $document->created_by_user_id,
            403
        );
    }
}

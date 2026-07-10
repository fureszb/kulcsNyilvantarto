<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::guard('tenant')->user();

        $query = Document::with(['location', 'createdBy'])->latest();

        // Sima worker csak a saját dokumentumait látja, a felügyelő szerepkörök mindent.
        if (!$user->canManage()) {
            $query->where('created_by_user_id', $user->id);
        }

        if ($request->filled('document_type')) {
            $query->where('document_type', $request->string('document_type'));
        }
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->integer('location_id'));
        }

        $documents = $query->paginate(25)->withQueryString();
        $locations = Location::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'locations' => $locations,
            'documentType' => $request->string('document_type')->toString(),
            'locationId' => $request->input('location_id'),
            'canCreate' => $user->canCreateDocuments(),
        ]);
    }

    public function show(Document $document): Response
    {
        $this->authorizeView($document);

        $document->load(['location', 'createdBy']);

        return Inertia::render('Documents/Show', ['document' => $document]);
    }

    public function preview(Document $document): StreamedResponse
    {
        $this->authorizeView($document);
        abort_unless($document->pdf_path && Storage::disk('local')->exists($document->pdf_path), 404);

        return Storage::disk('local')->response($document->pdf_path, null, ['Content-Disposition' => 'inline']);
    }

    public function download(Document $document): StreamedResponse
    {
        $this->authorizeView($document);
        abort_unless($document->pdf_path && Storage::disk('local')->exists($document->pdf_path), 404);

        $safeLabel = preg_replace('/[\/\\\\]/', '-', $document->typeLabel());

        return Storage::disk('local')->download($document->pdf_path, "{$safeLabel}-{$document->id}.pdf");
    }

    public function destroy(Document $document)
    {
        abort_unless(Auth::guard('tenant')->user()->isAdmin(), 403);

        if ($document->pdf_path) {
            Storage::disk('local')->delete($document->pdf_path);
        }

        $document->delete();

        return redirect()->route('documents.index')->with('success', 'Dokumentum törölve.');
    }

    private function authorizeView(Document $document): void
    {
        $user = Auth::guard('tenant')->user();

        abort_if(
            !$user->canManage() && $user->id !== $document->created_by_user_id,
            403
        );
    }
}

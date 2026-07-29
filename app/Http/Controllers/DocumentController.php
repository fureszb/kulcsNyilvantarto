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

        // Sima worker csak a saját dokumentumait látja; Területi igazgató/PM mindent lát
        // (mint az admin); Biztonsági vezető csak a saját felügyelt irodaházaiban dolgozó
        // csapatáét.
        if ($user->isSecurityLead()) {
            $query->whereIn('created_by_user_id', $this->securityLeadTeamUserIds($user));
        } elseif (!$user->canManage()) {
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
        $user = Auth::guard('tenant')->user();

        $document->load(['location', 'createdBy', 'reviewedBy']);

        return Inertia::render('Documents/Show', [
            'document' => $document,
            'canReview' => $user->canManage(),
        ]);
    }

    /** Vezetői jóváhagyás/átnézés jelölése — lásd `Api\DocumentController::review()`, ugyanaz a szabály mindkét felületen. */
    public function review(Document $document)
    {
        $user = Auth::guard('tenant')->user();
        abort_unless($user->canManage(), 403);
        $this->authorizeView($document);

        $document->update(['reviewed_at' => now(), 'reviewed_by_user_id' => $user->id]);

        return back()->with('success', 'Dokumentum jóváhagyva.');
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

        return Storage::disk('local')->download($document->pdf_path, "{$document->typeLabel()}-{$document->id}.pdf");
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

        if ($user->isSecurityLead()) {
            abort_unless(
                $user->id === $document->created_by_user_id
                    || $this->securityLeadTeamUserIds($user)->contains($document->created_by_user_id),
                403
            );
            return;
        }

        abort_if(
            !$user->canManage() && $user->id !== $document->created_by_user_id,
            403
        );
    }

    /** A biztonsági vezető felügyelt irodaházaiban dolgozó ("csapatába tartozó") dolgozók
     *  azonosítói — lásd `Api\DocumentController::securityLeadTeamUserIds()` (ugyanaz a
     *  szabály mindkét felületen, web és mobil API is). */
    private function securityLeadTeamUserIds(\App\Models\TenantUser $user): \Illuminate\Support\Collection
    {
        $locationIds = $user->managedLocations()->pluck('locations.id');

        return \App\Models\TenantUser::where('role', 'user')
            ->whereHas('workLocations', fn ($q) => $q->whereIn('locations.id', $locationIds))
            ->pluck('id');
    }
}

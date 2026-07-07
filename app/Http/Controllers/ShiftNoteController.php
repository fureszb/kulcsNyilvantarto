<?php

namespace App\Http\Controllers;

use App\Events\NewShiftNote;
use App\Mail\NewShiftNoteMail;
use App\Models\ActivityLog;
use App\Models\Location;
use App\Models\ShiftNote;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ShiftNoteController extends Controller
{
    /** Azok az irodaházak, amelyeknek a váltó-chatjét a user elérheti. Admin/igazgató
     *  mindet, biztonsági vezető a sajátjait, dolgozó/PM csak a saját (egy) irodaházát. */
    private function viewableLocations(TenantUser $user)
    {
        if ($user->hasAdminPowers()) {
            return Location::orderBy('name')->get(['id', 'name']);
        }
        if ($user->isSecurityLead()) {
            return $user->managedLocations()->orderBy('name')->get(['id', 'name']);
        }
        return $user->workLocations()->orderBy('name')->get(['id', 'name']);
    }

    public function index(Request $request)
    {
        $user = Auth::guard('tenant')->user();
        abort_if($user->isPropertyManager(), 403);

        $viewableLocations = $this->viewableLocations($user);
        $viewableIds = $viewableLocations->pluck('id')->all();

        $requestedLocationId = $request->filled('location_id') ? (int) $request->input('location_id') : null;
        $locationId = in_array($requestedLocationId, $viewableIds, true) ? $requestedLocationId : ($viewableIds[0] ?? null);

        $filterDate = $request->input('date', today()->toDateString());

        $notesQuery = ShiftNote::with('user')
            ->whereDate('note_date', $filterDate)
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($locationId) {
            $notesQuery->where('location_id', $locationId);
        } else {
            $notesQuery->whereRaw('0 = 1'); // nincs elérhető irodaház → üres lista
        }

        $notes = $notesQuery->paginate(40);
        $notes->appends(['date' => $filterDate, 'location_id' => $locationId]);

        $user->notes_read_at = now();
        $user->saveQuietly();

        return Inertia::render('Notes/Index', [
            'notes'             => $notes,
            'user'              => $user,
            'filterDate'        => $filterDate,
            'viewableLocations' => $viewableLocations,
            'selectedLocationId' => $locationId,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::guard('tenant')->user();
        abort_if($user->isPropertyManager(), 403);

        $request->validate([
            'content'     => 'required|string|max:1000',
            'location_id' => 'required|integer',
        ]);

        $viewableIds = $this->viewableLocations($user)->pluck('id')->all();
        abort_unless(in_array((int) $request->location_id, $viewableIds, true), 403);

        $today = today()->toDateString();

        ShiftNote::create([
            'user_id'     => $user->id,
            'location_id' => $request->location_id,
            'content'     => $request->content,
            'note_date'   => $today,
        ]);

        $location = Location::find($request->location_id);

        ActivityLog::record('shift_note.created', $user, "Váltóüzenet rögzítve ({$today})", [
            'note_date'   => $today,
            'location_id' => $request->location_id,
            'content'     => mb_substr($request->content, 0, 500),
        ]);

        // Az üzenet csak az érintett irodaházban dolgozóknak / az irodaházért felelős
        // biztonsági vezetőnek szól — nem az egész tenantnak.
        $recipientIds = TenantUser::where('is_active', true)
            ->where('role', '!=', 'property_manager')
            ->where('id', '!=', $user->id)
            ->where(function ($q) use ($request) {
                $q->where('location_id', $request->location_id)
                  ->orWhereHas('managedLocations', fn ($w) => $w->where('id', $request->location_id));
            })
            ->get(['id', 'name', 'email']);

        $tenant = app('tenant');
        if ($tenant?->slug) {
            broadcast(new NewShiftNote($tenant->slug, $user->name, $user->id));

            \App\Jobs\SendPushJob::dispatch(
                tenantSlug: $tenant->slug,
                userIds: $recipientIds->pluck('id')->toArray(),
                title: 'Új váltóüzenet — ' . $user->name . ($location ? " ({$location->name})" : ''),
                body: $request->content,
                url: route('notes.index'),
                tag: 'shift-note',
            );
        }

        $tenantName = $tenant?->name ?? 'KK Nyilvántartó';
        $loginUrl   = route('login');

        $recipientIds->whereNotNull('email')->each(function (TenantUser $recipient) use ($user, $request, $tenantName, $loginUrl) {
            try {
                Mail::to($recipient->email)->send(new NewShiftNoteMail(
                    authorName:   $user->name,
                    noteContent:  $request->content,
                    tenantName:   $tenantName,
                    loginUrl:     $loginUrl,
                ));
            } catch (\Throwable $e) {
                Log::error('NewShiftNoteMail failed: ' . $e->getMessage());
            }
        });

        return back()->with('success', 'Üzenet rögzítve.');
    }

    public function update(Request $request, ShiftNote $note)
    {
        $user = Auth::guard('tenant')->user();
        abort_if($user->isPropertyManager(), 403);
        abort_if($note->user_id !== $user->id, 403);

        $request->validate([
            'content'   => 'required|string|max:1000',
            'note_date' => 'required|date',
        ]);

        $oldContent = $note->content;
        $oldDate    = $note->note_date instanceof \Carbon\Carbon
            ? $note->note_date->toDateString()
            : (string) $note->note_date;

        $note->update([
            'content'   => $request->content,
            'note_date' => $request->note_date,
        ]);

        ActivityLog::record('shift_note.updated', $user, "Váltóüzenet módosítva ({$request->note_date})", [
            'old_date'    => $oldDate,
            'new_date'    => $request->note_date,
            'old_content' => mb_substr($oldContent, 0, 500),
            'new_content' => mb_substr($request->content, 0, 500),
        ]);

        return back()->with('success', 'Üzenet módosítva.');
    }

    public function destroy(ShiftNote $note)
    {
        $user = Auth::guard('tenant')->user();
        abort_if($user->isPropertyManager(), 403);
        abort_if($note->user_id !== $user->id && !$user->isAdmin(), 403);

        $deletedDate    = $note->note_date instanceof \Carbon\Carbon
            ? $note->note_date->toDateString()
            : (string) $note->note_date;
        $deletedContent = mb_substr($note->content, 0, 500);

        $note->delete();

        ActivityLog::record('shift_note.deleted', $user, "Váltóüzenet törölve ({$deletedDate})", [
            'note_date' => $deletedDate,
            'content'   => $deletedContent,
        ]);

        return back()->with('success', 'Üzenet törölve.');
    }
}

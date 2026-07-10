<?php

namespace App\Http\Controllers\Api;

use App\Events\NewShiftNote;
use App\Http\Resources\Api\LocationResource;
use App\Http\Resources\Api\ShiftNoteResource;
use App\Mail\NewShiftNoteMail;
use App\Models\ActivityLog;
use App\Models\Location;
use App\Models\ShiftNote;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ShiftNoteController extends Controller
{
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
        $user = $request->user();
        abort_if($user->isPropertyManager(), 403);

        $viewableLocations = $this->viewableLocations($user);
        $viewableIds = $viewableLocations->pluck('id')->all();

        $requestedLocationId = $request->filled('location_id') ? (int) $request->input('location_id') : null;
        $locationId = in_array($requestedLocationId, $viewableIds, true) ? $requestedLocationId : ($viewableIds[0] ?? null);

        $filterDate = $request->input('date', today()->toDateString());
        $page = max(1, (int) $request->input('page', 1));

        $notesQuery = ShiftNote::with('user')
            ->whereDate('note_date', $filterDate)
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($locationId) {
            $notesQuery->where('location_id', $locationId);
        } else {
            $notesQuery->whereRaw('0 = 1');
        }

        $notes = $notesQuery->paginate(40, ['*'], 'page', $page);

        $user->notes_read_at = now();
        $user->saveQuietly();

        return response()->json([
            'notes'                => ShiftNoteResource::collection($notes->items()),
            'filter_date'          => $filterDate,
            'viewable_locations'   => LocationResource::collection($viewableLocations),
            'selected_location_id' => $locationId,
            'page'                 => $notes->currentPage(),
            'has_more_pages'       => $notes->hasMorePages(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_if($user->isPropertyManager(), 403);

        $data = $request->validate([
            'content'     => 'required|string|max:1000',
            'location_id' => 'required|integer',
        ]);

        $viewableIds = $this->viewableLocations($user)->pluck('id')->all();
        abort_unless(in_array((int) $data['location_id'], $viewableIds, true), 403);

        $today = today()->toDateString();

        $note = ShiftNote::create([
            'user_id'     => $user->id,
            'location_id' => $data['location_id'],
            'content'     => $data['content'],
            'note_date'   => $today,
        ]);

        $location = Location::find($data['location_id']);

        ActivityLog::record('shift_note.created', $user, "Váltóüzenet rögzítve ({$today})", [
            'note_date'   => $today,
            'location_id' => $data['location_id'],
            'content'     => mb_substr($data['content'], 0, 500),
        ]);

        $recipientIds = TenantUser::where('is_active', true)
            ->where('role', '!=', 'property_manager')
            ->where('id', '!=', $user->id)
            ->where(function ($q) use ($data) {
                $q->where('location_id', $data['location_id'])
                  ->orWhereHas('managedLocations', fn ($w) => $w->where('id', $data['location_id']));
            })
            ->get(['id', 'name', 'email']);

        $tenant = app('tenant');
        if ($tenant?->slug) {
            broadcast(new NewShiftNote($tenant->slug, $user->name, $user->id));

            \App\Jobs\SendPushJob::dispatch(
                tenantSlug: $tenant->slug,
                userIds: $recipientIds->pluck('id')->toArray(),
                title: 'Új váltóüzenet — ' . $user->name . ($location ? " ({$location->name})" : ''),
                body: $data['content'],
                url: route('notes.index'),
                tag: 'shift-note',
            );
        }

        $tenantName = $tenant?->name ?? 'KK Nyilvántartó';
        $loginUrl = route('login');

        $recipientIds->whereNotNull('email')->each(function (TenantUser $recipient) use ($user, $data, $tenantName, $loginUrl) {
            try {
                Mail::to($recipient->email)->send(new NewShiftNoteMail(
                    authorName: $user->name,
                    noteContent: $data['content'],
                    tenantName: $tenantName,
                    loginUrl: $loginUrl,
                ));
            } catch (\Throwable $e) {
                Log::error('NewShiftNoteMail failed: ' . $e->getMessage());
            }
        });

        return (new ShiftNoteResource($note->load('user')))->response()->setStatusCode(201);
    }

    public function update(Request $request, ShiftNote $note)
    {
        $user = $request->user();
        abort_if($user->isPropertyManager(), 403);
        abort_if($note->user_id !== $user->id, 403);

        $data = $request->validate([
            'content'   => 'required|string|max:1000',
            'note_date' => 'required|date',
        ]);

        $oldContent = $note->content;
        $oldDate = optional($note->note_date)->toDateString();

        $note->update([
            'content'   => $data['content'],
            'note_date' => $data['note_date'],
        ]);

        ActivityLog::record('shift_note.updated', $user, "Váltóüzenet módosítva ({$data['note_date']})", [
            'old_date'    => $oldDate,
            'new_date'    => $data['note_date'],
            'old_content' => mb_substr($oldContent, 0, 500),
            'new_content' => mb_substr($data['content'], 0, 500),
        ]);

        return new ShiftNoteResource($note->fresh('user'));
    }

    public function destroy(Request $request, ShiftNote $note)
    {
        $user = $request->user();
        abort_if($user->isPropertyManager(), 403);
        abort_if($note->user_id !== $user->id && !$user->isAdmin(), 403);

        $deletedDate = optional($note->note_date)->toDateString();
        $deletedContent = mb_substr($note->content, 0, 500);

        $note->delete();

        ActivityLog::record('shift_note.deleted', $user, "Váltóüzenet törölve ({$deletedDate})", [
            'note_date' => $deletedDate,
            'content'   => $deletedContent,
        ]);

        return response()->noContent();
    }
}

<?php

namespace App\Http\Controllers;

use App\Events\NewShiftNote;
use App\Mail\NewShiftNoteMail;
use App\Models\ActivityLog;
use App\Models\ShiftNote;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ShiftNoteController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::guard('tenant')->user();
        abort_if($user->isPropertyManager(), 403);

        $filterDate = $request->input('date', today()->toDateString());

        $notes = ShiftNote::with('user')
            ->whereDate('note_date', $filterDate)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(40);

        $notes->appends(['date' => $filterDate]);

        $user->notes_read_at = now();
        $user->saveQuietly();

        return Inertia::render('Notes/Index', ['notes' => $notes, 'user' => $user, 'filterDate' => $filterDate]);
    }

    public function store(Request $request)
    {
        $user = Auth::guard('tenant')->user();
        abort_if($user->isPropertyManager(), 403);

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $today = today()->toDateString();

        ShiftNote::create([
            'user_id'   => $user->id,
            'content'   => $request->content,
            'note_date' => $today,
        ]);

        ActivityLog::record('shift_note.created', $user, "Váltóüzenet rögzítve ({$today})", [
            'note_date' => $today,
            'content'   => mb_substr($request->content, 0, 500),
        ]);

        $tenant = app('tenant');
        if ($tenant?->slug) {
            broadcast(new NewShiftNote($tenant->slug, $user->name, $user->id));

            \App\Jobs\SendPushJob::dispatch(
                tenantSlug: $tenant->slug,
                userIds: TenantUser::where('is_active', true)
                    ->where('role', '!=', 'property_manager')
                    ->where('id', '!=', $user->id)
                    ->pluck('id')
                    ->toArray(),
                title: 'Új váltóüzenet — ' . $user->name,
                body: $request->content,
                url: route('notes.index'),
                tag: 'shift-note',
            );
        }

        $tenantName = $tenant?->name ?? 'KK Nyilvántartó';
        $loginUrl   = route('login');

        TenantUser::where('is_active', true)
            ->where('role', '!=', 'property_manager')
            ->where('id', '!=', $user->id)
            ->whereNotNull('email')
            ->get()
            ->each(function (TenantUser $recipient) use ($user, $request, $tenantName, $loginUrl) {
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

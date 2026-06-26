<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\ShiftNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

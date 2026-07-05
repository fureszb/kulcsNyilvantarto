<?php

namespace App\Http\Controllers;

use App\Models\DirectorMessage;
use App\Models\TenantUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SecurityLeadController extends Controller
{
    public function messages(): Response
    {
        $user = Auth::guard('tenant')->user();

        $inbox = DirectorMessage::where('to_user_id', $user->id)
            ->where('is_anonymous', false)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($m) {
                $sender = $m->from_user_id
                    ? TenantUser::find($m->from_user_id)
                    : null;
                return [
                    'id'         => $m->id,
                    'content'    => $m->content,
                    'from_name'  => $sender?->name ?? 'Igazgató',
                    'created_at' => $m->created_at->format('Y.m.d H:i'),
                    'is_new'     => is_null($m->read_at),
                ];
            });

        // Olvasottnak jelöljük
        DirectorMessage::where('to_user_id', $user->id)
            ->where('is_anonymous', false)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $directors = $user->directors()->orderBy('name')->get(['users.id', 'users.name'])
            ->map(fn ($d) => ['id' => $d->id, 'name' => $d->name]);

        return Inertia::render('SecurityLead/Messages', [
            'welcomeName' => $user->name,
            'messages'    => $inbox,
            'directors'   => $directors,
        ]);
    }

    public function submitFeedback(Request $request): RedirectResponse
    {
        $request->validate([
            'director_id' => 'required|integer',
            'content'     => 'required|string|max:2000',
        ]);

        $user = Auth::guard('tenant')->user();

        // Ellenőrzés: csak a saját igazgatójának küldhet
        $isAssigned = $user->directors()->where('users.id', $request->director_id)->exists();
        if (!$isAssigned && $user->role !== 'admin') {
            abort(403);
        }

        DirectorMessage::create([
            'from_user_id' => $user->id, // DB-ben tároljuk, de soha nem exponáljuk
            'to_user_id'   => $request->director_id,
            'content'      => $request->content,
            'is_anonymous' => true,
        ]);

        return back()->with('success', 'Visszajelzés névtelenül elküldve.');
    }
}

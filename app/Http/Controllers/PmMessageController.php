<?php

namespace App\Http\Controllers;

use App\Models\PmMessage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PmMessageController extends Controller
{
    public function index()
    {
        $user = Auth::guard('tenant')->user();
        abort_if($user->isPropertyManager(), 403);

        $messages = PmMessage::visibleTo($user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        $user->messages_read_at = now();
        $user->saveQuietly();

        return Inertia::render('Messages/Index', ['messages' => $messages]);
    }
}

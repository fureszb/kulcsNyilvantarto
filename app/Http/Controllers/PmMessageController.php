<?php

namespace App\Http\Controllers;

use App\Events\NewPmReply;
use App\Models\PmMessage;
use App\Models\PmMessageReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PmMessageController extends Controller
{
    public function index()
    {
        $user = Auth::guard('tenant')->user();

        $messages = PmMessage::visibleTo($user->id)
            ->with(['replies'])
            ->orderByDesc('created_at')
            ->paginate(20);

        $user->messages_read_at = now();
        $user->saveQuietly();

        return Inertia::render('Messages/Index', ['messages' => $messages]);
    }

    public function storeReply(Request $request, PmMessage $message)
    {
        $request->validate(['content' => 'required|string|max:2000']);

        $user = Auth::guard('tenant')->user();

        $canReply = $message->send_to_all
            || $user->is_admin
            || $message->recipients()->where('user_id', $user->id)->exists();

        abort_unless($canReply, 403);

        $reply = PmMessageReply::create([
            'pm_message_id' => $message->id,
            'sender_id'     => $user->id,
            'sender_name'   => $user->name,
            'content'       => $request->content,
        ]);

        if ($message->sent_by_user_id && $message->sent_by_user_id !== $user->id) {
            \App\Jobs\SendPushJob::dispatch(
                tenantSlug: app('tenant')->slug,
                userIds: [$message->sent_by_user_id],
                title: 'Válasz az üzenetére — ' . $user->name,
                body: $reply->content,
                url: route('pm.messages'),
                tag: 'pm-message-' . $message->id,
            );
        }

        if ($message->sent_by_user_id) {
            try {
                broadcast(new NewPmReply(
                    reply: [
                        'id'            => $reply->id,
                        'pm_message_id' => $message->id,
                        'sender_name'   => $reply->sender_name,
                        'content'       => $reply->content,
                        'created_at'    => $reply->created_at->toISOString(),
                    ],
                    tenantSlug: app('tenant')->slug,
                    pmUserId: $message->sent_by_user_id,
                ))->toOthers();
            } catch (\Throwable $e) {
                Log::error('NewPmReply broadcast failed: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Válasz elküldve.');
    }
}

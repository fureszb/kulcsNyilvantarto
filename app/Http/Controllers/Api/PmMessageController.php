<?php

namespace App\Http\Controllers\Api;

use App\Events\NewPmMessage;
use App\Events\NewPmReply;
use App\Http\Resources\Api\PmMessageableUserResource;
use App\Http\Resources\Api\PmMessageResource;
use App\Mail\NewPmMessageMail;
use App\Models\ActivityLog;
use App\Models\PmMessage;
use App\Models\PmMessageRecipient;
use App\Models\PmMessageReply;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PmMessageController extends Controller
{
    private function messageableUsersFor(TenantUser $authUser)
    {
        if (!$authUser->isSecurityLead()) {
            return TenantUser::where('is_active', true)
                ->where('id', '!=', $authUser->id)
                ->orderBy('name')->get();
        }

        $managedLocationIds = $authUser->managedLocations()->pluck('locations.id');

        return TenantUser::where('is_active', true)
            ->where('id', '!=', $authUser->id)
            ->where(function ($q) use ($managedLocationIds) {
                $q->where('role', 'property_manager')
                  ->orWhereHas('workLocations', fn ($w) => $w->whereIn('locations.id', $managedLocationIds));
            })
            ->orderBy('name')->get();
    }

    /** Egyesített egyenlő szabály (a webes storeReply() is_admin hibáját NEM másoljuk le). */
    private function canReply(TenantUser $user, PmMessage $message): bool
    {
        return $message->send_to_all
            || $user->isAdmin()
            || $message->recipients()->where('user_id', $user->id)->exists();
    }

    private function canModify(TenantUser $user, PmMessage $message): bool
    {
        return $user->isAdmin() || $message->sent_by_user_id === $user->id;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->canManage()) {
            $query = PmMessage::with(['recipients.user', 'replies'])->orderByDesc('created_at');
            if (!$user->isAdmin()) {
                $query->where('sent_by_user_id', $user->id);
            }
        } else {
            $query = PmMessage::visibleTo($user->id)->with(['recipients.user', 'replies'])->orderByDesc('created_at');
        }

        $messages = $query->paginate(20);

        $user->messages_read_at = now();
        $user->saveQuietly();

        return PmMessageResource::collection($messages->items());
    }

    public function recipients(Request $request)
    {
        $user = $request->user();
        abort_unless($user->canManage(), 403);

        return PmMessageableUserResource::collection($this->messageableUsersFor($user));
    }

    public function store(Request $request)
    {
        $sender = $request->user();
        abort_unless($sender->canManage(), 403);

        $data = $request->validate([
            'content'     => 'required|string|max:2000',
            'send_to_all' => 'nullable|boolean',
            'user_ids'    => 'nullable|array',
            'user_ids.*'  => 'integer',
        ]);

        $sendToAll = $data['send_to_all'] ?? false;

        if ($sender->isSecurityLead()) {
            $sendToAll = false;
            $allowedIds = $this->messageableUsersFor($sender)->pluck('id')->all();
            $requestedIds = array_map('intval', $data['user_ids'] ?? []);
            if (array_diff($requestedIds, $allowedIds)) {
                abort(403, 'Csak a saját dolgozóinak vagy a PM-nek küldhet üzenetet.');
            }
        }

        if (!$sendToAll && empty($data['user_ids'])) {
            return response()->json([
                'message' => 'Válasszon legalább egy dolgozót, vagy küldje mindenkinek.',
                'errors'  => ['user_ids' => ['Válasszon legalább egy dolgozót, vagy küldje mindenkinek.']],
            ], 422);
        }

        $message = PmMessage::create([
            'content'         => $data['content'],
            'send_to_all'     => $sendToAll,
            'sent_by_user_id' => $sender->id,
            'sent_by_name'    => $sender->name,
        ]);

        $userIds = [];
        if (!$sendToAll) {
            foreach ($data['user_ids'] as $userId) {
                PmMessageRecipient::create(['pm_message_id' => $message->id, 'user_id' => (int) $userId]);
                $userIds[] = (int) $userId;
            }
        } else {
            $userIds = TenantUser::where('is_active', true)->where('id', '!=', $sender->id)->pluck('id')->toArray();
        }

        $slug = app('tenant')->slug;
        broadcast(new NewPmMessage(
            message: [
                'id'          => $message->id,
                'content'     => $message->content,
                'created_at'  => $message->created_at->toISOString(),
                'send_to_all' => $message->send_to_all,
                'sent_by_name'=> $message->sent_by_name,
            ],
            tenantSlug: $slug,
            recipientIds: $userIds,
        ))->toOthers();

        \App\Jobs\SendPushJob::dispatch(
            tenantSlug: $slug,
            userIds: $userIds,
            title: 'Új PM üzenet — ' . $sender->name,
            body: $message->content,
            url: route('messages.index'),
            tag: 'pm-message-' . $message->id,
        );

        $tenantName = app('tenant')?->name ?? 'KK Nyilvántartó';
        $loginUrl = route('login');

        TenantUser::whereIn('id', $userIds)
            ->where('role', '!=', 'property_manager')
            ->whereNotNull('email')
            ->get()
            ->each(function (TenantUser $recipient) use ($sender, $message, $tenantName, $loginUrl) {
                try {
                    Mail::to($recipient->email)->send(new NewPmMessageMail(
                        senderName: $sender->name,
                        messageContent: $message->content,
                        recipientName: $recipient->name,
                        tenantName: $tenantName,
                        loginUrl: $loginUrl,
                    ));
                } catch (\Throwable $e) {
                    Log::error('NewPmMessageMail failed: ' . $e->getMessage());
                }
            });

        $recipientCount = $sendToAll ? null : count($data['user_ids'] ?? []);
        $recipientLabel = $sendToAll ? 'mindenkinek' : "{$recipientCount} felhasználónak";
        ActivityLog::record('pm_message.sent', $sender, "PM üzenet elküldve {$recipientLabel}", [
            'message_id'      => $message->id,
            'send_to_all'     => $sendToAll,
            'recipient_count' => $recipientCount,
            'content'         => mb_substr($data['content'], 0, 500),
        ]);

        return (new PmMessageResource($message->load('recipients.user', 'replies')))->response()->setStatusCode(201);
    }

    public function storeReply(Request $request, PmMessage $message)
    {
        $data = $request->validate(['content' => 'required|string|max:2000']);
        $sender = $request->user();

        abort_unless($this->canReply($sender, $message), 403);

        $reply = PmMessageReply::create([
            'pm_message_id' => $message->id,
            'sender_id'     => $sender->id,
            'sender_name'   => $sender->name,
            'content'       => $data['content'],
        ]);

        $slug = app('tenant')->slug;
        $recipientIds = $message->send_to_all
            ? TenantUser::where('is_active', true)->where('id', '!=', $sender->id)->pluck('id')->toArray()
            : $message->recipients()->pluck('user_id')->toArray();

        try {
            broadcast(new NewPmReply(
                reply: [
                    'id'            => $reply->id,
                    'pm_message_id' => $message->id,
                    'sender_name'   => $reply->sender_name,
                    'content'       => $reply->content,
                    'created_at'    => $reply->created_at->toISOString(),
                ],
                tenantSlug: $slug,
                pmUserId: $message->sent_by_user_id,
            ))->toOthers();
        } catch (\Throwable $e) {
            Log::error('PmMessage storeReply broadcast failed: ' . $e->getMessage());
        }

        \App\Jobs\SendPushJob::dispatch(
            tenantSlug: $slug,
            userIds: array_values(array_diff($recipientIds, [$sender->id])),
            title: 'Válasz az üzenetére — ' . $sender->name,
            body: $reply->content,
            url: route('messages.index'),
            tag: 'pm-message-' . $message->id,
        );

        return response()->json([
            'id'            => $reply->id,
            'pm_message_id' => $reply->pm_message_id,
            'sender_id'     => $reply->sender_id,
            'sender_name'   => $reply->sender_name,
            'content'       => $reply->content,
            'created_at'    => $reply->created_at->toIso8601String(),
        ], 201);
    }

    public function update(Request $request, PmMessage $message)
    {
        $user = $request->user();
        abort_unless($this->canModify($user, $message), 403);

        $data = $request->validate(['content' => 'required|string|max:2000']);

        $oldContent = $message->content;
        $message->update(['content' => $data['content']]);

        ActivityLog::record('pm_message.updated', $user, 'PM üzenet módosítva', [
            'message_id'  => $message->id,
            'old_content' => mb_substr($oldContent, 0, 500),
            'new_content' => mb_substr($data['content'], 0, 500),
        ]);

        return new PmMessageResource($message->fresh(['recipients.user', 'replies']));
    }

    public function destroy(Request $request, PmMessage $message)
    {
        $user = $request->user();
        abort_unless($this->canModify($user, $message), 403);

        ActivityLog::record('pm_message.deleted', $user, 'PM üzenet törölve', [
            'content' => mb_substr($message->content, 0, 500),
        ]);
        $message->delete();

        return response()->noContent();
    }
}

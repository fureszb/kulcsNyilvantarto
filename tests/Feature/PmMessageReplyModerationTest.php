<?php

namespace Tests\Feature;

use App\Models\PmMessage;
use App\Models\PmMessageReply;

/**
 * 2026-07-18-i kör: a hozzászólások (PmMessageReply) szerkesztése/törlése — korábban csak az
 * eredeti PM üzenet (PmMessage) volt módosítható/törölhető, a válaszok nem. A szabály a
 * PmMessage-ével azonos: a saját válaszát bárki szerkesztheti/törölheti, máson kívül csak admin.
 */
class PmMessageReplyModerationTest extends TenantTestCase
{
    private function messageWithReply(int $senderId, string $senderName): array
    {
        $message = PmMessage::create(['content' => 'Eredeti üzenet', 'send_to_all' => true, 'sent_by_user_id' => null, 'sent_by_name' => 'PM']);
        $reply = PmMessageReply::create([
            'pm_message_id' => $message->id,
            'sender_id'     => $senderId,
            'sender_name'   => $senderName,
            'content'       => 'Eredeti válasz',
        ]);
        return [$message, $reply];
    }

    public function test_own_reply_can_be_updated(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Reply Owner']);
        [$message, $reply] = $this->messageWithReply($worker->id, $worker->name);

        $response = $this->putJson(
            $this->apiUrl("pm-messages/{$message->id}/replies/{$reply->id}"),
            ['content' => 'Módosított válasz'],
            $this->authHeaders($worker),
        );

        $response->assertOk()->assertJsonPath('content', 'Módosított válasz');
        $this->assertSame('Módosított válasz', $reply->fresh()->content);
    }

    public function test_own_reply_can_be_deleted(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Reply Owner']);
        [$message, $reply] = $this->messageWithReply($worker->id, $worker->name);

        $response = $this->deleteJson(
            $this->apiUrl("pm-messages/{$message->id}/replies/{$reply->id}"),
            [],
            $this->authHeaders($worker),
        );

        $response->assertNoContent();
        $this->assertNull(PmMessageReply::find($reply->id));
    }

    public function test_other_users_reply_cannot_be_updated_by_non_admin(): void
    {
        $author = $this->createTenantUser(['role' => 'user', 'name' => 'Reply Author']);
        $intruder = $this->createTenantUser(['role' => 'user', 'name' => 'Intruder']);
        [$message, $reply] = $this->messageWithReply($author->id, $author->name);

        $response = $this->putJson(
            $this->apiUrl("pm-messages/{$message->id}/replies/{$reply->id}"),
            ['content' => 'Illetéktelen módosítás'],
            $this->authHeaders($intruder),
        );

        $response->assertStatus(403);
        $this->assertSame('Eredeti válasz', $reply->fresh()->content);
    }

    public function test_other_users_reply_cannot_be_deleted_by_non_admin(): void
    {
        $author = $this->createTenantUser(['role' => 'user', 'name' => 'Reply Author 2']);
        $intruder = $this->createTenantUser(['role' => 'user', 'name' => 'Intruder 2']);
        [$message, $reply] = $this->messageWithReply($author->id, $author->name);

        $response = $this->deleteJson(
            $this->apiUrl("pm-messages/{$message->id}/replies/{$reply->id}"),
            [],
            $this->authHeaders($intruder),
        );

        $response->assertStatus(403);
        $this->assertNotNull(PmMessageReply::find($reply->id));
    }

    public function test_admin_can_update_and_delete_any_reply(): void
    {
        $admin = $this->createTenantUser(['role' => 'admin', 'name' => 'Admin Mod']);
        $author = $this->createTenantUser(['role' => 'user', 'name' => 'Reply Author 3']);
        [$message, $reply] = $this->messageWithReply($author->id, $author->name);

        $this->putJson(
            $this->apiUrl("pm-messages/{$message->id}/replies/{$reply->id}"),
            ['content' => 'Admin által módosítva'],
            $this->authHeaders($admin),
        )->assertOk();
        $this->assertSame('Admin által módosítva', $reply->fresh()->content);

        $this->deleteJson(
            $this->apiUrl("pm-messages/{$message->id}/replies/{$reply->id}"),
            [],
            $this->authHeaders($admin),
        )->assertNoContent();
        $this->assertNull(PmMessageReply::find($reply->id));
    }

    /** Regresszió-védelem: a végpont ne engedje egy MÁSIK üzenethez tartozó reply-id-t elfogadni. */
    public function test_reply_must_belong_to_the_given_message(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Mismatch Worker']);
        [$messageA, $replyA] = $this->messageWithReply($worker->id, $worker->name);
        $messageB = PmMessage::create(['content' => 'Másik üzenet', 'send_to_all' => true, 'sent_by_user_id' => null, 'sent_by_name' => 'PM']);

        $response = $this->putJson(
            $this->apiUrl("pm-messages/{$messageB->id}/replies/{$replyA->id}"),
            ['content' => 'Nem kellene menjen át'],
            $this->authHeaders($worker),
        );

        $response->assertStatus(404);
    }
}

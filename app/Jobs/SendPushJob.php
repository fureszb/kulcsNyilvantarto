<?php

namespace App\Jobs;

use App\Models\TenantUser;
use App\Notifications\ChatPushNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendPushJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $tries = 2;
    public int $timeout = 120;

    /** @param array<int> $userIds */
    public function __construct(
        public string $tenantSlug,
        public array $userIds,
        public string $title,
        public string $body,
        public string $url,
        public string $tag = 'chat',
    ) {}

    public function handle(): void
    {
        // A queue worker tenant-kontextus nélkül fut — ugyanaz a minta,
        // mint a ProcessDocumentJob-ban
        config([
            'database.connections.tenant.database' =>
                storage_path('database/tenants/' . $this->tenantSlug . '.sqlite'),
        ]);
        DB::purge('tenant');

        $users = TenantUser::whereIn('id', $this->userIds)
            ->where('is_active', true)
            ->get();

        foreach ($users as $user) {
            try {
                // sendNow: a WebPush csatorna maga törli a 404/410-es (lejárt)
                // feliratkozásokat a REST hívás reportja alapján
                $user->notifyNow(new ChatPushNotification(
                    title: $this->title,
                    body: $this->body,
                    url: $this->url,
                    tag: $this->tag,
                ));
            } catch (\Throwable $e) {
                Log::warning("WebPush küldés sikertelen (user {$user->id}): " . $e->getMessage());
            }
        }
    }
}

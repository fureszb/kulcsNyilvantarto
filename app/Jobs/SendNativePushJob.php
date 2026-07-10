<?php

namespace App\Jobs;

use App\Models\DeviceToken;
use App\Services\ApnsPushService;
use App\Services\FcmPushService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;

/**
 * Natív mobil push (FCM/APNs) — ugyanaz a hívási minta, mint a meglévő
 * SendPushJob (Web Push), de a device_tokens táblát célozza. Szándékosan
 * NEM a meglévő SendPushJob-ba lett beépítve: amíg nincs valós
 * FCM/APNs hitelesítő adat beállítva, a beépítés csak zajos, mindig
 * sikertelen extra hívásokat jelentene minden váltóüzenetnél/PM-üzenetnél.
 * A hívó oldalakon (ShiftNoteController, PmMessageController stb.) ott,
 * ahol SendPushJob::dispatch(...) fut, ezt a jobot is dispatch-elni kell
 * majd UGYANAZOKKAL a paraméterekkel, ha a natív push élesítésre kerül.
 */
class SendNativePushJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $tries = 2;
    public int $timeout = 60;

    /** @param array<int> $userIds */
    public function __construct(
        public string $tenantSlug,
        public array $userIds,
        public string $title,
        public string $body,
        public string $url,
        public string $tag = 'chat',
    ) {
    }

    public function handle(FcmPushService $fcm, ApnsPushService $apns): void
    {
        config([
            'database.connections.tenant.database' =>
                storage_path('database/tenants/' . $this->tenantSlug . '.sqlite'),
        ]);
        DB::purge('tenant');

        $tokens = DeviceToken::whereIn('user_id', $this->userIds)->get();

        foreach ($tokens as $token) {
            $data = ['url' => $this->url, 'tag' => $this->tag];

            if ($token->platform === 'android') {
                $fcm->send($token->device_token, $this->title, $this->body, $data);
            } elseif ($token->platform === 'ios') {
                $apns->send($token->device_token, $this->title, $this->body, $data);
            }
        }
    }
}

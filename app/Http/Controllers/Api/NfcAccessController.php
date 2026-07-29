<?php

namespace App\Http\Controllers\Api;

use App\Events\NfcAccessEvent;
use App\Jobs\SendNativePushJob;
use App\Jobs\SendPushJob;
use App\Models\ActivityLog;
use App\Models\Location;
use App\Models\NfcNotification;
use App\Models\NfcTag;
use App\Models\TenantUser;
use App\Services\NfcChecklistService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NfcAccessController extends Controller
{
    /**
     * A rendszer NEM beléptető/kiléptető kapu — a biztonsági őr a helyszínre felhelyezett
     * NFC-matricákat (checkpointokat, pl. "Hátsó ajtó", "Lift") scanneli be a bejárási/csekkolási
     * körön, hogy igazolja: az adott pontnál járt. Ezért minden sikeres scan egy önálló, a
     * korábbi scanektől független "checkpoint igazolva" esemény — nincs be/kilépés-állapot,
     * nincs `is_present`/`last_entry_location_id` írás (2026-07-18-i korrekció: az eredeti
     * telephely-szintű be/kilépés-toggle hibásan "kilépésnek" értelmezte, ha ugyanazon a
     * telephelyen egy MÁSIK checkpointot scanneltek be közvetlenül az előző után).
     */
    public function scan(Request $request)
    {
        $data = $request->validate([
            'tag_uid'     => 'required|string|max:255',
            'scanned_at'  => 'nullable|date',
        ]);

        $user = $request->user();
        $occurredAt = $data['scanned_at'] ?? now()->toIso8601String();

        $tag = NfcTag::where('uid', $data['tag_uid'])->where('is_active', true)->with('location')->first();

        if (!$tag) {
            return response()->json(['status' => 'denied', 'message' => 'Ismeretlen NFC matrica.'], 404);
        }

        $location = $tag->location;
        $hasAccess = $user->nfcLocations()->where('locations.id', $location->id)->exists();

        if (!$hasAccess) {
            ActivityLog::record('nfc.denied', $user, "Elutasított ellenőrzés — {$location->name}", [
                'tag_uid' => $tag->uid, 'tag_label' => $tag->label, 'location_id' => $location->id, 'location_name' => $location->name,
            ]);

            $this->notifyEveryone($user, $location, 'denied', $occurredAt);

            return response()->json([
                'status'   => 'denied',
                'message'  => 'Nincs jogosultsága ehhez a telephelyhez.',
                'tag'      => ['id' => $tag->id, 'label' => $tag->label],
            ], 403);
        }

        ActivityLog::record('nfc.checkpoint', $user, "Ellenőrizve — {$tag->label} ({$location->name})", [
            'tag_uid' => $tag->uid, 'tag_label' => $tag->label, 'location_id' => $location->id, 'location_name' => $location->name,
        ]);

        $this->notifyEveryone($user, $location, 'checkpoint', $occurredAt);

        return response()->json([
            'status'   => 'checked',
            'location' => ['id' => $location->id, 'name' => $location->name],
            'tag'      => ['id' => $tag->id, 'label' => $tag->label],
        ]);
    }

    /**
     * A bejelentkezett user saját NFC-előzményei (checkpoint-ellenőrzés/elutasítás), legfrissebb
     * elöl — a mobil "NFC előzmények" profil-menüpont valós adatforrása (korábban MOCK volt).
     * `nfc.entry`/`nfc.exit` a 2026-07-18 előtti (be/kilépés-modellből származó) régi sorok
     * visszamenőleges kompatibilitása miatt van benne — új sor csak `nfc.checkpoint`/`nfc.denied`
     * lesz.
     */
    public function history(Request $request)
    {
        $user = $request->user();

        $logs = ActivityLog::where('user_id', $user->id)
            ->whereIn('event_type', ['nfc.checkpoint', 'nfc.entry', 'nfc.exit', 'nfc.denied'])
            ->orderByDesc('occurred_at')
            ->limit(100)
            ->get(['id', 'event_type', 'metadata', 'occurred_at']);

        $entries = $logs->map(fn (ActivityLog $log) => [
            'id'            => $log->id,
            'event_type'    => $log->event_type,
            'location_name' => $log->metadata['location_name'] ?? null,
            'tag_label'     => $log->metadata['tag_label'] ?? null,
            'occurred_at'   => $log->occurred_at->toIso8601String(),
        ])->values();

        return response()->json(['entries' => $entries]);
    }

    /**
     * "Mai bejárás" — a user NFC-beléptetéssel engedélyezett telephelyeinek (`nfcLocations()`,
     * NEM a "hol dolgozik" `location_id` mező — a kettő eltérhet, lásd `NfcChecklistService`)
     * aktív NFC-matricái + hogy a mai napon beolvasták-e már (bárki, nem csak a user saját
     * scanjei) — a mobil "Mai bejárás" profil-menüpont valós adatforrása (korábban MOCK volt,
     * kitalált emeleti csoportokkal; az `NfcTag`-nek nincs emelet/csoport mezője, ezért itt egy
     * egyszerű, admin-címke szerint rendezett lapos lista van, floor-grouping nélkül).
     */
    public function todayChecklist(Request $request, NfcChecklistService $checklistService)
    {
        $user = $request->user();

        return response()->json([
            'location_names' => $checklistService->locationNamesForUser($user),
            'points'         => $checklistService->pointsForUser($user),
        ]);
    }

    /** Minden NFC-log rekordról (sikeres checkpoint ÉS elutasított kísérlet is) a scannelő
     *  kivételével minden aktív dolgozó azonnali értesítést kap — élő broadcast (bell + toast),
     *  perzisztált NfcNotification-sor, és push (web + natív). */
    private function notifyEveryone(TenantUser $user, Location $location, string $type, string $occurredAt): void
    {
        $recipientIds = TenantUser::where('is_active', true)
            ->where('id', '!=', $user->id)
            ->pluck('id');

        if ($recipientIds->isEmpty()) {
            return;
        }

        $tenant = app('tenant');
        if (!$tenant?->slug) {
            return;
        }

        $title = 'NFC ellenőrzés';
        $body  = $type === 'denied'
            ? "{$user->name} jogosulatlan ellenőrzési kísérlet — {$location->name}"
            : "{$user->name} ellenőrzést végzett — {$location->name}";

        // A Reverb-en keresztüli élő broadcast opcionális kényelmi funkció — ha a Reverb
        // szerver átmenetileg nem elérhető, ez ne buktassa el a teljes ellenőrzési kérést
        // (a push job és az in-app notification-sor ettől függetlenül továbbra is fusson).
        try {
            broadcast(new NfcAccessEvent(
                tenantSlug: $tenant->slug,
                recipientIds: $recipientIds->all(),
                userId: $user->id,
                userName: $user->name,
                locationId: $location->id,
                locationName: $location->name,
                type: $type,
                occurredAt: $occurredAt,
            ));
        } catch (\Throwable $e) {
            Log::warning("NFC broadcast sikertelen (user {$user->id}, location {$location->id}): " . $e->getMessage());
        }

        $now = now();
        NfcNotification::insert($recipientIds->map(fn ($recipientId) => [
            'user_id'       => $recipientId,
            'actor_user_id' => $user->id,
            'actor_name'    => $user->name,
            'location_id'   => $location->id,
            'location_name' => $location->name,
            'type'          => $type,
            'occurred_at'   => $occurredAt,
            'created_at'    => $now,
            'updated_at'    => $now,
        ])->all());

        SendPushJob::dispatch(
            tenantSlug: $tenant->slug,
            userIds: $recipientIds->all(),
            title: $title,
            body: $body,
            url: route('presence.index'),
            tag: 'nfc',
        );
        SendNativePushJob::dispatch(
            tenantSlug: $tenant->slug,
            userIds: $recipientIds->all(),
            title: $title,
            body: $body,
            url: route('presence.index'),
            tag: 'nfc',
        );
    }
}

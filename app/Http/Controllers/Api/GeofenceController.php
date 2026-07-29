<?php

namespace App\Http\Controllers\Api;

use App\Events\GeofenceZoneEvent;
use App\Events\GuardPositionUpdated;
use App\Jobs\SendNativePushJob;
use App\Jobs\SendPushJob;
use App\Models\ActivityLog;
use App\Models\GeofenceEvent;
use App\Models\GuardPosition;
use App\Models\Location;
use App\Models\NfcNotification;
use App\Models\TenantUser;
use App\Models\VezenylesEmployee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Location\Coordinate;
use Location\Polygon;

class GeofenceController extends Controller
{
    /** Egymást követő zónán-kívüli ping-ek száma, ami után riasztás tüzel (jitter/drift debounce). */
    private const OUTSIDE_THRESHOLD = 3;

    public function ping(Request $request)
    {
        $data = $request->validate([
            'lat'          => 'required|numeric|between:-90,90',
            'lng'          => 'required|numeric|between:-180,180',
            'accuracy'     => 'nullable|numeric',
            'recorded_at'  => 'required|date',
        ]);

        $user = $request->user();
        $location = $user->workLocations;

        if (!$location || !$location->polygon) {
            $position = GuardPosition::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'lat'         => $data['lat'],
                    'lng'         => $data['lng'],
                    'accuracy'    => $data['accuracy'] ?? null,
                    'recorded_at' => $data['recorded_at'],
                    'zone_status' => 'unknown',
                ],
            );

            $this->broadcastPositionUpdate($user, $user->location_id, $position);

            return response()->json(['status' => 'unknown', 'zone_status' => $position->zone_status]);
        }

        $polygon = new Polygon();
        $polygon->addPoints(array_map(
            fn (array $point) => new Coordinate($point[0], $point[1]),
            $location->polygon,
        ));

        $isInside = $polygon->contains(new Coordinate((float) $data['lat'], (float) $data['lng']));

        $previous = GuardPosition::where('user_id', $user->id)->first();
        $previousStatus = $previous?->zone_status ?? 'unknown';
        $consecutiveOutside = $isInside ? 0 : ($previous?->consecutive_outside_count ?? 0) + 1;

        // A megerősített (confirmed) zone_status csak akkor vált 'outside'-ra, ha a
        // küszöböt elérte az egymást követő kívüli ping-ek száma — eddig megtartja
        // az előző megerősített állapotot (ez a jitter/drift debounce lényege).
        if ($isInside) {
            $confirmedStatus = 'inside';
        } elseif ($consecutiveOutside >= self::OUTSIDE_THRESHOLD) {
            $confirmedStatus = 'outside';
        } else {
            $confirmedStatus = $previousStatus === 'unknown' ? 'unknown' : $previousStatus;
        }

        $position = GuardPosition::updateOrCreate(
            ['user_id' => $user->id],
            [
                'lat'                        => $data['lat'],
                'lng'                        => $data['lng'],
                'accuracy'                   => $data['accuracy'] ?? null,
                'recorded_at'                => $data['recorded_at'],
                'zone_status'                => $confirmedStatus,
                'consecutive_outside_count'  => $consecutiveOutside,
            ],
        );

        // Riasztás csak az átmenetnél tüzel, nem minden egyes kívüli pingnél.
        $justLeftZone = $confirmedStatus === 'outside' && $previousStatus !== 'outside';
        $justReturnedToZone = $confirmedStatus === 'inside' && $previousStatus === 'outside';

        if ($justLeftZone) {
            $this->recordAndNotify($user, $location, 'zone_exit', (float) $data['lat'], (float) $data['lng'], $data['recorded_at']);
        } elseif ($justReturnedToZone) {
            $this->recordAndNotify($user, $location, 'zone_enter', (float) $data['lat'], (float) $data['lng'], $data['recorded_at']);
        }

        $this->broadcastPositionUpdate($user, $location->id, $position);

        return response()->json(['status' => 'ok', 'zone_status' => $position->zone_status]);
    }

    /** Egy adott dolgozó zóna-be/kilépési előzménye — a "Ki van bent" kártya lenyíló
     *  aktivitás-listájához. Csak a dolgozó telephelyét felügyelő vezető kérheti le
     *  (ugyanaz a hatókör-ellenőrzés, mint a `PresenceController::index()`-ben). */
    public function events(Request $request, int $userId)
    {
        $viewer = $request->user();
        abort_unless($viewer->canManage(), 403);

        $target = TenantUser::findOrFail($userId);

        if (!$viewer->hasAdminPowers()) {
            // Ugyanazon a jogosultsági alapon enged, amin a "Ki van bent" lista maga
            // megjeleníti a személyt (Vezénylés-terület → telephely), NEM a `location_id`
            // mezőn — a kettő valós adatban eltérhet (lásd VezenylesController::index()
            // hasonló hatókör-számítása), és a lista sosem mutatna olyan kártyát, amit ez
            // a végpont utána elutasítana.
            $allowedLocationIds = $viewer->isSecurityLead()
                ? $viewer->managedLocations()->pluck('id')
                : collect([$viewer->location_id])->filter();

            $visible = VezenylesEmployee::where('user_id', $target->id)
                ->whereHas('area', fn ($q) => $q->whereIn('location_id', $allowedLocationIds))
                ->exists();

            abort_unless($visible, 403);
        }

        $events = GeofenceEvent::where('user_id', $target->id)
            ->with('location:id,name')
            ->orderByDesc('occurred_at')
            ->limit(20)
            ->get(['id', 'location_id', 'event_type', 'occurred_at'])
            ->map(fn (GeofenceEvent $event) => [
                'id'           => $event->id,
                'type'         => $event->event_type,
                'locationName' => $event->location?->name ?? '',
                'occurredAt'   => $event->occurred_at->toIso8601String(),
            ]);

        return response()->json(['events' => $events]);
    }

    /** Minden pingnél tüzel (nem csak zóna-átlépésnél), hogy a "Ki van bent" térkép
     *  valóban élőben kövesse az őr mozgását, ne csak megerősített zóna-váltásnál. */
    private function broadcastPositionUpdate(TenantUser $user, ?int $locationId, GuardPosition $position): void
    {
        if ($locationId === null) {
            return;
        }

        $tenant = app('tenant');
        if (!$tenant?->slug) {
            return;
        }

        try {
            broadcast(new GuardPositionUpdated(
                tenantSlug: $tenant->slug,
                userId: $user->id,
                userName: $user->name,
                locationId: $locationId,
                lat: $position->lat,
                lng: $position->lng,
                zoneStatus: $position->zone_status,
                recordedAt: $position->recorded_at->toIso8601String(),
            ));
        } catch (\Throwable $e) {
            Log::warning("Pozíció-broadcast sikertelen (user {$user->id}): " . $e->getMessage());
        }
    }

    private function recordAndNotify(TenantUser $user, Location $location, string $type, float $lat, float $lng, string $occurredAt): void
    {
        GeofenceEvent::create([
            'user_id'     => $user->id,
            'location_id' => $location->id,
            'event_type'  => $type,
            'lat'         => $lat,
            'lng'         => $lng,
            'occurred_at' => $occurredAt,
        ]);

        ActivityLog::record("geofence.{$type}", $user, $this->activityDescription($type, $location), [
            'location_id' => $location->id, 'location_name' => $location->name, 'lat' => $lat, 'lng' => $lng,
        ]);

        $this->notifyBosses($user, $location, $type, $occurredAt);
    }

    private function activityDescription(string $type, Location $location): string
    {
        return $type === 'zone_exit'
            ? "Zóna elhagyva — {$location->name}"
            : "Visszatért a zónába — {$location->name}";
    }

    /** Telephely felelősei — biztonsági vezető + property manager (ugyanaz a minta, mint az NFC beléptetésnél). */
    private function notifyBosses(TenantUser $user, Location $location, string $type, string $occurredAt): void
    {
        $bossIds = TenantUser::where('is_active', true)
            ->where(function ($q) use ($location) {
                $q->where('id', $location->security_lead_id)
                  ->orWhere(function ($q2) use ($location) {
                      $q2->where('location_id', $location->id)->where('role', 'property_manager');
                  });
            })
            ->pluck('id')
            ->unique()
            ->values();

        if ($bossIds->isEmpty()) {
            return;
        }

        $tenant = app('tenant');
        if (!$tenant?->slug) {
            return;
        }

        // A Reverb-en keresztüli élő broadcast opcionális kényelmi funkció — ha a Reverb
        // szerver átmenetileg nem elérhető, ez ne buktassa el a teljes ping-kérést (a
        // pozíció és a geofence-esemény ekkorra már el van mentve, a push job ettől
        // függetlenül továbbra is fusson).
        try {
            broadcast(new GeofenceZoneEvent(
                tenantSlug: $tenant->slug,
                bossIds: $bossIds->all(),
                userId: $user->id,
                userName: $user->name,
                locationId: $location->id,
                locationName: $location->name,
                type: $type,
                lat: $user->guardPosition?->lat ?? 0.0,
                lng: $user->guardPosition?->lng ?? 0.0,
                occurredAt: $occurredAt,
            ));
        } catch (\Throwable $e) {
            Log::warning("Geofence broadcast sikertelen (user {$user->id}, location {$location->id}): " . $e->getMessage());
        }

        $now = now();
        NfcNotification::insert($bossIds->map(fn ($bossId) => [
            'user_id'       => $bossId,
            'actor_user_id' => $user->id,
            'actor_name'    => $user->name,
            'location_id'   => $location->id,
            'location_name' => $location->name,
            'type'          => $type,
            'occurred_at'   => $occurredAt,
            'created_at'    => $now,
            'updated_at'    => $now,
        ])->all());

        $messages = [
            'zone_exit'  => "{$user->name} elhagyta a zónát — {$location->name}",
            'zone_enter' => "{$user->name} visszatért a zónába — {$location->name}",
        ];

        SendPushJob::dispatch(
            tenantSlug: $tenant->slug,
            userIds: $bossIds->all(),
            title: 'Geofencing riasztás',
            body: $messages[$type] ?? $messages['zone_exit'],
            url: route('presence.index'),
            tag: 'geofence',
        );

        SendNativePushJob::dispatch(
            tenantSlug: $tenant->slug,
            userIds: $bossIds->all(),
            title: 'Geofencing riasztás',
            body: $messages[$type] ?? $messages['zone_exit'],
            url: route('presence.index'),
            tag: 'geofence',
        );
    }
}

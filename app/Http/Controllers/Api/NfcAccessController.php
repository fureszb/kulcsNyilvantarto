<?php

namespace App\Http\Controllers\Api;

use App\Events\NfcAccessEvent;
use App\Jobs\SendPushJob;
use App\Models\ActivityLog;
use App\Models\NfcTag;
use App\Models\TenantUser;
use Illuminate\Http\Request;

class NfcAccessController extends Controller
{
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

        if ($user->is_present) {
            // Kilépés — mindig engedélyezett, nincs jogosultság-check.
            $user->update([
                'is_present' => false,
            ]);

            ActivityLog::record('nfc.exit', $user, "Kilépés — {$location->name}", [
                'tag_uid' => $tag->uid, 'location_id' => $location->id,
            ]);

            $this->notifyBosses($user, $location, 'exited', $occurredAt);

            return response()->json(['status' => 'exited', 'location' => ['id' => $location->id, 'name' => $location->name]]);
        }

        $hasAccess = $user->nfcLocations()->where('locations.id', $location->id)->exists();

        if (!$hasAccess) {
            ActivityLog::record('nfc.denied', $user, "Elutasított belépés — {$location->name}", [
                'tag_uid' => $tag->uid, 'location_id' => $location->id,
            ]);

            $this->notifyBosses($user, $location, 'denied', $occurredAt);

            return response()->json(['status' => 'denied', 'message' => 'Nincs jogosultsága ehhez a telephelyhez.'], 403);
        }

        $user->update([
            'is_present'              => true,
            'last_entry_at'           => now(),
            'last_entry_location_id'  => $location->id,
        ]);

        ActivityLog::record('nfc.entry', $user, "Belépés — {$location->name}", [
            'tag_uid' => $tag->uid, 'location_id' => $location->id,
        ]);

        $this->notifyBosses($user, $location, 'entered', $occurredAt);

        return response()->json(['status' => 'entered', 'location' => ['id' => $location->id, 'name' => $location->name]]);
    }

    /** Telephely felelősei — biztonsági vezető + property manager. */
    private function notifyBosses(TenantUser $user, $location, string $type, string $occurredAt): void
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

        broadcast(new NfcAccessEvent(
            tenantSlug: $tenant->slug,
            bossIds: $bossIds->all(),
            userId: $user->id,
            userName: $user->name,
            locationId: $location->id,
            locationName: $location->name,
            type: $type,
            occurredAt: $occurredAt,
        ));

        $messages = [
            'entered' => "{$user->name} belépett — {$location->name}",
            'exited'  => "{$user->name} kilépett — {$location->name}",
            'denied'  => "{$user->name} jogosulatlan belépési kísérlet — {$location->name}",
        ];

        SendPushJob::dispatch(
            tenantSlug: $tenant->slug,
            userIds: $bossIds->all(),
            title: 'NFC beléptetés',
            body: $messages[$type] ?? $messages['entered'],
            url: route('presence.index'),
            tag: 'nfc',
        );
    }
}

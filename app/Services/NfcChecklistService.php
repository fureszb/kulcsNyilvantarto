<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\NfcTag;
use App\Models\TenantUser;
use Illuminate\Support\Collection;

/**
 * Egy user mai NFC-checkpoint-lefedettsége — a "Mai bejárás" profil-menüpont
 * (`NfcAccessController::todayChecklist`) és a Kezdőlap "Jelenlegi állapotod" kártyája
 * (`HomeController::presence`, mindkét variáns) közös adatforrása, hogy ezek ne térjenek el
 * egymástól.
 *
 * **2026-07-18-i korrekció:** a checklistnek a user `nfcLocations()` (NFC beléptetési
 * jogosultság — `nfc_access` pivot tábla, admin felületen külön multi-select) alapján kell
 * szűrnie, NEM a `location_id` ("Irodaház, hol dolgozik") mező alapján — a kettő eltérhet
 * egymástól (pl. egy dolgozó "otthoni" irodaháza más lehet, mint amihez NFC-beléptetési joga
 * van), és a `NfcAccessController::scan()` is a `nfcLocations()`-t nézi jogosultság-ellenőrzéskor
 * — ha a checklist a `location_id`-t nézné, olyan pontokat listázhatna, amiket a user valójában
 * nem is tud beolvasni (nincs jogosultsága), vagy pont a valós, engedélyezett pontjait hagyná ki.
 */
class NfcChecklistService
{
    /**
     * @return array<int, array{id:int,label:string,location_name:string,scanned:bool,scanned_at:?string}>
     */
    public function pointsForUser(TenantUser $user): array
    {
        $locationIds = $user->nfcLocations()->pluck('locations.id');
        if ($locationIds->isEmpty()) {
            return [];
        }

        $tags = NfcTag::whereIn('location_id', $locationIds)
            ->where('is_active', true)
            ->with('location:id,name')
            ->orderBy('label')
            ->get(['id', 'uid', 'label', 'location_id']);

        $tagUids = $tags->pluck('uid')->all();

        $todayLogsByTagUid = ActivityLog::whereIn('event_type', ['nfc.checkpoint', 'nfc.entry', 'nfc.exit'])
            ->whereDate('occurred_at', now()->toDateString())
            ->whereIn('metadata->tag_uid', $tagUids)
            ->get(['metadata', 'occurred_at'])
            ->groupBy(fn (ActivityLog $log) => $log->metadata['tag_uid'] ?? null);

        return $tags->map(function (NfcTag $tag) use ($todayLogsByTagUid) {
            $lastLog = $todayLogsByTagUid->get($tag->uid)?->sortByDesc('occurred_at')->first();
            return [
                'id'            => $tag->id,
                'label'         => $tag->label ?: $tag->uid,
                'location_name' => $tag->location?->name ?? '',
                'scanned'       => $lastLog !== null,
                'scanned_at'    => $lastLog?->occurred_at?->toIso8601String(),
            ];
        })->values()->all();
    }

    /** A user NFC-beléptetéssel engedélyezett telephelyeinek nevei, vesszővel elválasztva (a
     *  jellemző eset egy telephely, de a jogosultság technikailag több is lehet egyszerre). */
    public function locationNamesForUser(TenantUser $user): Collection
    {
        return $user->nfcLocations()->orderBy('name')->pluck('name');
    }
}

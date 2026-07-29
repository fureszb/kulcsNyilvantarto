<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\TenantUser;
use App\Models\VezenylesSchedule;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PresenceController extends Controller
{
    /** "Ki van bent" — 2026-07-18 óta NEM az NFC self-report (`is_present`) alapján, mert a
     *  rendszer nem beléptető/kiléptető kapu (checkpoint-csekkoló rendszer, lásd
     *  `NfcAccessController`) — a napi Vezenylés-beosztás a forrás: aki mára konkrét
     *  óraszámmal be van írva szolgálatba, az számít "bent"-nek. */
    public function index()
    {
        /** @var TenantUser $user */
        $user = Auth::guard('tenant')->user();
        abort_unless($user->canManage(), 403);

        if ($user->hasAdminPowers()) {
            $locationIds = Location::pluck('id');
        } elseif ($user->isSecurityLead()) {
            $locationIds = $user->managedLocations()->pluck('id');
        } else {
            $locationIds = collect([$user->location_id])->filter();
        }

        $scheduledEntries = VezenylesSchedule::scheduledEntriesForDate(now());

        $presentUsers = TenantUser::with('workLocations:id,name')
            ->whereIn('id', $scheduledEntries->keys())
            ->whereIn('location_id', $locationIds)
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'location_id'])
            ->map(fn (TenantUser $u) => [
                'id'             => $u->id,
                'name'           => $u->name,
                'role'           => $u->role,
                'location_id'    => $u->location_id,
                'location'       => $u->workLocations ? ['id' => $u->workLocations->id, 'name' => $u->workLocations->name] : null,
                'schedule_value' => $scheduledEntries->get($u->id)?->value,
            ])
            ->values();

        $locations = Location::whereIn('id', $locationIds)
            ->where('is_active', true)
            ->withCount(['workers'])
            ->orderBy('name')
            ->get(['id', 'name', 'polygon', 'security_lead_id']);

        $guardPositions = TenantUser::with('guardPosition')
            ->whereIn('location_id', $locationIds)
            ->whereHas('guardPosition')
            ->get(['id', 'name', 'location_id'])
            ->map(fn (TenantUser $user) => [
                'user_id'      => $user->id,
                'user_name'    => $user->name,
                'location_id'  => $user->location_id,
                'lat'          => $user->guardPosition->lat,
                'lng'          => $user->guardPosition->lng,
                'zone_status'  => $user->guardPosition->zone_status,
                'recorded_at'  => $user->guardPosition->recorded_at,
            ]);

        return Inertia::render('Presence/Index', [
            'presentUsers'   => $presentUsers,
            'locations'      => $locations,
            'guardPositions' => $guardPositions,
        ]);
    }
}

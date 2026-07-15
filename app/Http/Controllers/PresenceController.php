<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\TenantUser;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PresenceController extends Controller
{
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

        $presentUsers = TenantUser::with('lastEntryLocation:id,name')
            ->where('is_present', true)
            ->whereIn('last_entry_location_id', $locationIds)
            ->orderBy('last_entry_at', 'desc')
            ->get(['id', 'name', 'role', 'last_entry_at', 'last_entry_location_id']);

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

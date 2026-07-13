<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Location;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NfcAccessLogController extends Controller
{
    public function index(Request $request)
    {
        /** @var TenantUser $user */
        $user = Auth::guard('tenant')->user();
        abort_unless($user->canManage(), 403);

        if ($user->hasAdminPowers()) {
            $viewableLocations = Location::orderBy('name')->get(['id', 'name']);
        } elseif ($user->isSecurityLead()) {
            $viewableLocations = $user->managedLocations()->orderBy('name')->get(['id', 'name']);
        } else {
            $viewableLocations = $user->workLocations()->orderBy('name')->get(['id', 'name']);
        }
        $viewableLocationIds = $viewableLocations->pluck('id')->all();

        $dateFrom = $request->input('date_from', now()->toDateString());
        $dateTo   = $request->input('date_to', now()->toDateString());
        $userId   = $request->input('user_id');
        $locationId = $request->input('location_id');

        $query = ActivityLog::where('event_type', 'like', 'nfc.%')
            ->whereBetween('occurred_at', ["{$dateFrom} 00:00:00", "{$dateTo} 23:59:59"])
            ->whereIn('metadata->location_id', $viewableLocationIds)
            ->orderByDesc('occurred_at');

        if ($userId) {
            $query->where('user_id', $userId);
        }
        if ($locationId && in_array((int) $locationId, $viewableLocationIds, true)) {
            $query->where('metadata->location_id', (int) $locationId);
        }

        $logs = $query->paginate(50)->withQueryString();

        $workers = TenantUser::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('NfcLog/Index', [
            'logs'              => $logs,
            'dateFrom'          => $dateFrom,
            'dateTo'            => $dateTo,
            'userId'            => $userId,
            'locationId'        => $locationId,
            'workers'           => $workers,
            'viewableLocations' => $viewableLocations,
        ]);
    }
}

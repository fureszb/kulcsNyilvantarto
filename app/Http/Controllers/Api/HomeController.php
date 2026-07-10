<?php

namespace App\Http\Controllers\Api;

use App\Models\Check;
use App\Models\Location;
use App\Models\Setting;
use App\Models\TrainingResult;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();

        $checksToday = Check::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();

        $trainingsCompleted = TrainingResult::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();

        if ($user->isSecurityLead()) {
            $venueMode = 'buildings';
            $venues = $user->managedLocations()->where('is_active', true)
                ->withCount('items')->orderBy('name')->get()
                ->map(fn ($l) => $this->buildingVenue($l));
        } elseif ($user->role === 'user') {
            $venueMode = 'tenants';
            $myLocation = $user->workLocations;
            $venues = $myLocation
                ? $myLocation->groups()->withCount('items')->get()
                    ->map(fn ($g) => [
                        'id'                 => $g->id,
                        'name'               => $g->name,
                        'description'        => null,
                        'icon'               => null,
                        'logo_path'          => null,
                        'responsible_person' => null,
                        'email'              => null,
                        'items_count'        => $g->items_count,
                    ])
                : collect();
        } else {
            $venueMode = 'buildings';
            $venues = Location::where('is_active', true)
                ->withCount('items')
                ->orderBy('name')
                ->get()
                ->map(fn ($l) => $this->buildingVenue($l));
        }

        return response()->json([
            'checks_today'           => $checksToday,
            'trainings_completed'    => $trainingsCompleted,
            'venue_mode'             => $venueMode,
            'venues'                 => $venues->values(),
            'security_module_visible'=> Setting::get('security_module_visible', '1') === '1',
        ]);
    }

    private function buildingVenue(Location $l): array
    {
        return [
            'id'                 => $l->id,
            'name'               => $l->name,
            'description'        => $l->description,
            'icon'               => $l->icon,
            'logo_path'          => $l->logo_path,
            'responsible_person' => $l->responsible_person,
            'email'              => $l->email,
            'items_count'        => $l->items_count,
        ];
    }
}

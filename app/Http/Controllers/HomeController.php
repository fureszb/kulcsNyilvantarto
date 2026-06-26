<?php

namespace App\Http\Controllers;

use App\Models\Check;
use App\Models\Location;
use App\Models\Training;
use App\Models\TrainingResult;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function portal()
    {
        $welcomeName = session()->pull('user_welcome');
        $user = Auth::guard('tenant')->user();

        $checksToday = Check::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();

        $trainingsCompleted = TrainingResult::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();

        $locations = Location::where('is_active', true)
            ->withCount('items')
            ->orderBy('name')
            ->get()
            ->map(fn($l) => [
                'id'         => $l->id,
                'name'       => $l->name,
                'itemsCount' => $l->items_count,
            ]);

        return Inertia::render('Portal', [
            'welcomeName'        => $welcomeName,
            'checksToday'        => $checksToday,
            'trainingsCompleted' => $trainingsCompleted,
            'locations'          => $locations,
        ]);
    }

    public function keys()
    {
        $locations = Location::where('is_active', true)
            ->withCount('items')
            ->orderBy('name')
            ->get();

        return Inertia::render('Home', ['locations' => $locations]);
    }

    public function locationDetail(Location $location)
    {
        if (!$location->is_active) {
            abort(404);
        }

        $authUser = Auth::guard('tenant')->user();

        $checks = Check::with('checkItems')
            ->where('location_id', $location->id)
            ->when(
                !$authUser->isAdmin() && !$authUser->isPropertyManager(),
                fn($q) => $q->where('user_id', $authUser->id)
            )
            ->orderByDesc('created_at')
            ->paginate(15);

        return Inertia::render('Location/Show', ['location' => $location, 'checks' => $checks]);
    }
}

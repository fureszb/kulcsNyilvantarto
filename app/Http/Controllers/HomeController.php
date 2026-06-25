<?php

namespace App\Http\Controllers;

use App\Models\Check;
use App\Models\Location;
use App\Models\Training;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function portal()
    {
        $welcomeName = session()->pull('user_welcome');
        return view('portal', compact('welcomeName'));
    }

    public function keys()
    {
        $locations = Location::where('is_active', true)
            ->withCount('items')
            ->orderBy('name')
            ->get();

        return view('home', compact('locations'));
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

        return view('location.show', compact('location', 'checks'));
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Check;
use App\Models\EmergencyContact;
use App\Models\Location;
use App\Models\Setting;
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
                'id'                 => $l->id,
                'name'               => $l->name,
                'description'        => $l->description,
                'icon'               => $l->icon,
                'logo_path'          => $l->logo_path,
                'responsible_person' => $l->responsible_person,
                'email'              => $l->email,
                'itemsCount'         => $l->items_count,
            ]);

        $emergencyContacts = EmergencyContact::orderBy('category')->orderBy('sort_order')->orderBy('name')->get()
            ->map(fn($c) => [
                'id'         => $c->id,
                'category'   => $c->category,
                'name'       => $c->name,
                'phone'      => $c->phone,
                'note'       => $c->note,
            ]);

        return Inertia::render('Portal', [
            'welcomeName'           => $welcomeName,
            'checksToday'           => $checksToday,
            'trainingsCompleted'    => $trainingsCompleted,
            'locations'             => $locations,
            'securityModuleVisible' => Setting::get('security_module_visible', '1') === '1',
            'emergencyContacts'     => $emergencyContacts,
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

        $checks = Check::withCount([
                'checkItems as check_items_count',
                'checkItems as checked_count' => fn($q) => $q->where('is_checked', true),
            ])
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

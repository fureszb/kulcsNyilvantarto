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

        // A "Helyszínek a házban" widget szerepkörönként más szintet mutat:
        //  - biztonsági vezető: a saját irodaházai (Location)
        //  - dolgozó: a saját irodaházában lévő BÉRLŐK (ItemGroup) — neki nem az
        //    irodaházak listája hasznos (ő már tudja, hol dolgozik), hanem hogy
        //    az adott házon belül kinek a kulcsait/kártyáit kezeli
        //  - egyéb (admin): az összes aktív irodaház, mint eddig
        if ($user->isSecurityLead()) {
            $venueMode = 'buildings';
            $venues = $user->managedLocations()->where('is_active', true)
                ->withCount('items')->orderBy('name')->get()
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
        } elseif ($user->role === 'user') {
            $venueMode = 'tenants';
            $myLocation = $user->workLocations;
            $venues = $myLocation
                ? $myLocation->groups()->withCount('items')->get()
                    ->map(fn($g) => [
                        'id'                 => $g->id,
                        'name'               => $g->name,
                        'description'        => null,
                        'icon'               => null,
                        'logo_path'          => null,
                        'responsible_person' => null,
                        'email'              => null,
                        'itemsCount'         => $g->items_count,
                    ])
                : collect();
        } else {
            $venueMode = 'buildings';
            $venues = Location::where('is_active', true)
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
        }

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
            'locations'             => $venues,
            'venueMode'             => $venueMode,
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

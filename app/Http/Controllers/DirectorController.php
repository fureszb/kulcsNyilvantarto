<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Területi igazgató felülete. Az 1. fázisban minimál kezdőoldal a hozzá
 * rendelt biztonsági vezetők listájával; a statisztikák, névjegykártyák,
 * havi riport és a célkitűzések a következő fázisokban épülnek rá.
 */
class DirectorController extends Controller
{
    public function dashboard(): Response
    {
        $user = Auth::guard('tenant')->user();

        // A hozzárendelt vezetők + azok irodaházai (a hierarchia előnézete)
        $leads = $user->supervisedLeads()
            ->with(['managedLocations:id,name'])
            ->get(['users.id', 'users.name', 'users.email'])
            ->map(fn ($lead) => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'locations' => $lead->managedLocations->map(fn ($l) => [
                    'id' => $l->id,
                    'name' => $l->name,
                ])->values(),
            ]);

        return Inertia::render('Director/Dashboard', [
            'welcomeName' => $user->name,
            'leads' => $leads,
        ]);
    }
}

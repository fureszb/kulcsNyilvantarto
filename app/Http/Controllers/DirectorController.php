<?php

namespace App\Http\Controllers;

use App\Services\PerformanceStatsService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Területi igazgató felülete. A vezérlőpult a felügyelt biztonsági vezetők
 * névjegykártyáit mutatja: vezetőnként az irodaházak összesített teljesítménye
 * (kész arány − fluktuáció), lenyitva az irodaházankénti bontás.
 */
class DirectorController extends Controller
{
    public function dashboard(PerformanceStatsService $stats): Response
    {
        $user = Auth::guard('tenant')->user();

        return Inertia::render('Director/Dashboard', [
            'welcomeName' => $user->name,
            'leads'       => $stats->directorOverview($user),
        ]);
    }
}

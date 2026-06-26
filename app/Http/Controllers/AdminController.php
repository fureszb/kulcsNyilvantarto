<?php

namespace App\Http\Controllers;

use App\Models\Check;
use App\Models\Location;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'locations'    => Location::count(),
            'checks_today' => Check::whereDate('created_at', today())->count(),
            'checks_total' => Check::count(),
        ];

        $recentChecks = Check::with('location')
            ->withCount(['checkItems', 'checkItems as checked_count' => fn($q) => $q->where('is_checked', true)])
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', ['stats' => $stats, 'recentChecks' => $recentChecks]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        $tenants = Tenant::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Landing', ['tenants' => $tenants]);
    }
}

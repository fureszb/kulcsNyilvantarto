<?php

namespace App\Http\Controllers;

use App\Models\Tenant;

class LandingController extends Controller
{
    public function index()
    {
        $tenants = Tenant::where('is_active', true)->orderBy('name')->get();

        return view('landing', compact('tenants'));
    }
}

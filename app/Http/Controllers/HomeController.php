<?php

namespace App\Http\Controllers;

use App\Models\Location;

class HomeController extends Controller
{
    public function index()
    {
        $locations = Location::where('is_active', true)
            ->withCount('items')
            ->orderBy('name')
            ->get();

        return view('home', compact('locations'));
    }
}

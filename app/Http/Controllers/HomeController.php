<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Training;

class HomeController extends Controller
{
    public function portal()
    {
        return view('portal');
    }

    public function keys()
    {
        $locations = Location::where('is_active', true)
            ->withCount('items')
            ->orderBy('name')
            ->get();

        return view('home', compact('locations'));
    }
}

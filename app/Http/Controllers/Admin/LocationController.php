<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::withCount(['allItems', 'checks'])->orderBy('name')->get();
        return view('admin.locations.index', compact('locations'));
    }

    public function create()
    {
        return view('admin.locations.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'responsible_person' => 'nullable|string|max:255',
            'email'              => 'nullable|email|max:255',
            'is_active'          => 'boolean',
        ]);

        Location::create($validated + ['is_active' => $request->boolean('is_active', true)]);

        return redirect()->route('admin.locations.index')->with('success', 'Helyszín sikeresen létrehozva!');
    }

    public function show(Location $location)
    {
        $items = $location->allItems()->get();
        return view('admin.locations.show', compact('location', 'items'));
    }

    public function edit(Location $location)
    {
        return view('admin.locations.edit', compact('location'));
    }

    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'responsible_person' => 'nullable|string|max:255',
            'email'              => 'nullable|email|max:255',
        ]);

        $location->update($validated + ['is_active' => $request->boolean('is_active', false)]);

        return redirect()->route('admin.locations.index')->with('success', 'Helyszín frissítve!');
    }

    public function destroy(Location $location)
    {
        if ($location->checks()->exists()) {
            return back()->with('error', 'Nem törölhető: ellenőrzési előzmények tartoznak hozzá!');
        }

        $location->delete();
        return redirect()->route('admin.locations.index')->with('success', 'Helyszín törölve!');
    }
}

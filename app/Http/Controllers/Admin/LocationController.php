<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::withCount('items')->orderBy('name')->get();
        return Inertia::render('Admin/Locations/Index', ['locations' => $locations]);
    }

    public function create()
    {
        return Inertia::render('Admin/Locations/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'description'        => 'nullable|string|max:2000',
            'icon'               => 'nullable|string|max:20',
            'logo'               => 'nullable|image|max:1024',
            'responsible_person' => 'nullable|string|max:255',
            'email'              => 'nullable|email|max:255',
            'is_active'          => 'boolean',
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $slug = app('tenant')->slug;
            $logoPath = $request->file('logo')->store("logos/{$slug}", 'public');
        }

        $icon = $logoPath ? null : ($request->input('icon') ?: null);

        Location::create([
            'name'               => $validated['name'],
            'description'        => $validated['description'] ?? null,
            'icon'               => $icon,
            'logo_path'          => $logoPath,
            'responsible_person' => $validated['responsible_person'] ?? null,
            'email'              => $validated['email'] ?? null,
            'is_active'          => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.locations.index')->with('success', 'Helyszín sikeresen létrehozva!');
    }

    public function show(Location $location)
    {
        $items  = $location->allItems()->with('group')->get();
        $groups = $location->groups()->with('items')->get();
        $location->setRelation('items', $items);
        $location->setRelation('groups', $groups);
        return Inertia::render('Admin/Locations/Show', ['location' => $location]);
    }

    public function edit(Location $location)
    {
        return Inertia::render('Admin/Locations/Edit', ['location' => $location]);
    }

    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'description'        => 'nullable|string|max:2000',
            'icon'               => 'nullable|string|max:20',
            'logo'               => 'nullable|image|max:1024',
            'remove_logo'        => 'boolean',
            'responsible_person' => 'nullable|string|max:255',
            'email'              => 'nullable|email|max:255',
        ]);

        $logoPath = $location->logo_path;

        if ($request->boolean('remove_logo') || $request->hasFile('logo')) {
            if ($location->logo_path) {
                Storage::disk('public')->delete($location->logo_path);
            }
            $logoPath = null;
        }

        if ($request->hasFile('logo')) {
            $slug = app('tenant')->slug;
            $logoPath = $request->file('logo')->store("logos/{$slug}", 'public');
        }

        $icon = $logoPath ? null : ($request->input('icon') ?: null);

        $location->update([
            'name'               => $validated['name'],
            'description'        => $validated['description'] ?? null,
            'icon'               => $icon,
            'logo_path'          => $logoPath,
            'responsible_person' => $validated['responsible_person'] ?? null,
            'email'              => $validated['email'] ?? null,
            'is_active'          => $request->boolean('is_active', false),
        ]);

        return redirect()->route('admin.locations.index')->with('success', 'Helyszín frissítve!');
    }

    public function destroy(Location $location)
    {
        if ($location->checks()->exists()) {
            return back()->with('error', 'Nem törölhető: ellenőrzési előzmények tartoznak hozzá!');
        }

        if ($location->logo_path) {
            Storage::disk('public')->delete($location->logo_path);
        }

        $location->delete();
        return redirect()->route('admin.locations.index')->with('success', 'Helyszín törölve!');
    }
}

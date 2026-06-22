<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $items  = $location->allItems()->get();
        $groups = $location->groups()->with('allItems')->get();
        return view('admin.locations.show', compact('location', 'items', 'groups'));
    }

    public function edit(Location $location)
    {
        return view('admin.locations.edit', compact('location'));
    }

    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
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

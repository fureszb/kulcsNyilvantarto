<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ItemGroup;
use App\Models\Location;
use Illuminate\Http\Request;

class ItemGroupController extends Controller
{
    public function store(Request $request, Location $location)
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'sort_order' => 'integer|min:0|max:9999',
        ]);

        $location->groups()->create([
            'name'       => $request->input('name'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return redirect()->route('admin.locations.show', $location)->with('success', 'Csoport hozzáadva!');
    }

    public function update(Request $request, Location $location, ItemGroup $group)
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'sort_order' => 'integer|min:0|max:9999',
        ]);

        $group->update([
            'name'       => $request->input('name'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return redirect()->route('admin.locations.show', $location)->with('success', 'Csoport frissítve!');
    }

    public function destroy(Location $location, ItemGroup $group)
    {
        $group->allItems()->update(['group_id' => null]);
        $group->delete();

        return redirect()->route('admin.locations.show', $location)
                         ->with('success', 'Csoport törölve – a tételek csoporton kívülre kerültek!');
    }
}

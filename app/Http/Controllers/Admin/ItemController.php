<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Location;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function store(Request $request, Location $location)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'type'       => 'required|in:key,card',
            'sort_order' => 'integer|min:0|max:9999',
        ]);

        $location->allItems()->create($validated + ['sort_order' => $request->input('sort_order', 0)]);

        return redirect()->route('admin.locations.show', $location)->with('success', 'Tétel hozzáadva!');
    }

    public function update(Request $request, Location $location, Item $item)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'type'       => 'required|in:key,card',
            'sort_order' => 'integer|min:0|max:9999',
        ]);

        $item->update($validated + ['is_active' => $request->boolean('is_active', false)]);

        return redirect()->route('admin.locations.show', $location)->with('success', 'Tétel frissítve!');
    }

    public function destroy(Location $location, Item $item)
    {
        $item->delete();
        return redirect()->route('admin.locations.show', $location)->with('success', 'Tétel törölve!');
    }
}

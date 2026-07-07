<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CheckItem;
use App\Models\Item;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ItemController extends Controller
{
    /** Admin bármely irodaházat kezelhet; biztonsági vezető csak a sajátjait. */
    private function authorizeLocation(Location $location): void
    {
        $user = Auth::guard('tenant')->user();
        if ($user->isSecurityLead()) {
            abort_unless($user->managedLocations()->where('locations.id', $location->id)->exists(), 403);
        }
    }

    public function store(Request $request, Location $location)
    {
        $this->authorizeLocation($location);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'type'       => 'required|in:key,card',
            'sort_order' => 'integer|min:0|max:9999',
            'group_id'   => 'nullable|integer',
        ]);

        $location->allItems()->create($validated + ['sort_order' => $request->input('sort_order', 0)]);

        return redirect()->back()->with('success', 'Tétel hozzáadva!');
    }

    public function update(Request $request, Location $location, Item $item)
    {
        $this->authorizeLocation($location);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'type'       => 'required|in:key,card',
            'sort_order' => 'integer|min:0|max:9999',
            'group_id'   => 'nullable|integer',
        ]);

        $item->update($validated + ['is_active' => $request->boolean('is_active', false)]);

        return redirect()->back()->with('success', 'Tétel frissítve!');
    }

    public function destroy(Location $location, Item $item)
    {
        $this->authorizeLocation($location);

        CheckItem::where('item_id', $item->id)->delete();
        $item->delete();
        return redirect()->back()->with('success', 'Tétel törölve!');
    }
}

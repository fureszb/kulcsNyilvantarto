<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ItemGroup;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ItemGroupController extends Controller
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

        $request->validate([
            'name'       => 'required|string|max:255',
            'sort_order' => 'integer|min:0|max:9999',
        ]);

        $location->groups()->create([
            'name'       => $request->input('name'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return redirect()->back()->with('success', 'Csoport hozzáadva!');
    }

    public function update(Request $request, Location $location, ItemGroup $group)
    {
        $this->authorizeLocation($location);

        $request->validate([
            'name'       => 'required|string|max:255',
            'sort_order' => 'integer|min:0|max:9999',
        ]);

        $group->update([
            'name'       => $request->input('name'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return redirect()->back()->with('success', 'Csoport frissítve!');
    }

    public function destroy(Location $location, ItemGroup $group)
    {
        $this->authorizeLocation($location);

        $group->allItems()->update(['group_id' => null]);
        $group->delete();

        return redirect()->back()
                         ->with('success', 'Csoport törölve – a tételek csoporton kívülre kerültek!');
    }
}

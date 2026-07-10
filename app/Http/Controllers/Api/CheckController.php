<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\Api\CheckResource;
use App\Http\Resources\Api\ItemGroupResource;
use App\Http\Resources\Api\ItemResource;
use App\Http\Resources\Api\LocationResource;
use App\Mail\CheckCompletedMail;
use App\Models\ActivityLog;
use App\Models\Check;
use App\Models\CheckItem;
use App\Models\Location;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CheckController extends Controller
{
    public function locations(Request $request)
    {
        $user = $request->user();

        $query = Location::where('is_active', true)->orderBy('name');

        if ($user->role === 'user' && $user->location_id) {
            $query->where('id', $user->location_id);
        } elseif ($user->role === 'user') {
            $query->whereRaw('0 = 1');
        }

        return LocationResource::collection($query->get());
    }

    public function checklist(Location $location)
    {
        if (!$location->is_active) {
            abort(404);
        }

        $groups = $location->groups()->with('items')->get();
        $ungroupedItems = $location->items()->whereNull('group_id')->get();

        return response()->json([
            'location'        => new LocationResource($location),
            'groups'          => ItemGroupResource::collection($groups),
            'ungrouped_items' => ItemResource::collection($ungroupedItems),
        ]);
    }

    public function store(Request $request, Location $location)
    {
        if (!$location->is_active) {
            abort(404);
        }

        $validated = $request->validate([
            'checked_item_ids'   => 'nullable|array',
            'checked_item_ids.*' => 'integer',
            'notes'              => 'nullable|string|max:1000',
            'extra_email'        => 'nullable|email|max:255',
        ]);

        $checkedIds = $validated['checked_item_ids'] ?? [];
        $user = $request->user();

        $check = Check::create([
            'location_id' => $location->id,
            'user_id'     => $user->id,
            'checked_by'  => $user->name,
            'extra_email' => $validated['extra_email'] ?? null,
            'notes'       => $validated['notes'] ?? null,
        ]);

        foreach ($location->items as $item) {
            CheckItem::create([
                'check_id'   => $check->id,
                'item_id'    => $item->id,
                'is_checked' => in_array($item->id, $checkedIds, true),
            ]);
        }

        $check->load('checkItems.item', 'location.groups');

        $recipients = array_unique(array_filter([
            Setting::get('global_email'),
            $location->email,
            $validated['extra_email'] ?? null,
        ]));

        foreach ($recipients as $recipient) {
            try {
                Mail::to($recipient)->send(new CheckCompletedMail($check));
            } catch (\Throwable) {
                // mail failure does not abort check submission
            }
        }

        $checkedCount = $check->checkItems->where('is_checked', true)->count();
        $totalCount = $check->checkItems->count();
        ActivityLog::record('check.completed', $user,
            "Ellenőrzés: {$location->name} – {$checkedCount}/{$totalCount} tétel", [
                'check_id'    => $check->id,
                'location_id' => $location->id,
                'checked'     => $checkedCount,
                'total'       => $totalCount,
            ]);

        return (new CheckResource($check))->response()->setStatusCode(201);
    }

    public function show(Request $request, Check $check)
    {
        $user = $request->user();

        abort_if(
            !$user->isAdmin() && !$user->isPropertyManager() && $user->id !== $check->user_id,
            403
        );

        $check->load('checkItems.item', 'location');

        return new CheckResource($check);
    }

    public function update(Request $request, Check $check)
    {
        $user = $request->user();

        abort_if(
            !$user->isAdmin() && ($user->isPropertyManager() || $user->id !== $check->user_id),
            403
        );

        $validated = $request->validate([
            'checked_item_ids'   => 'nullable|array',
            'checked_item_ids.*' => 'integer',
            'notes'              => 'nullable|string|max:1000',
            'extra_email'        => 'nullable|email|max:255',
        ]);

        $checkedIds = $validated['checked_item_ids'] ?? [];

        $check->update([
            'notes'       => $validated['notes'] ?? null,
            'extra_email' => $validated['extra_email'] ?? null,
        ]);

        foreach ($check->checkItems as $checkItem) {
            $checkItem->update([
                'is_checked' => in_array($checkItem->item_id, $checkedIds, true),
            ]);
        }

        $check->load('checkItems.item', 'location');

        return new CheckResource($check);
    }
}

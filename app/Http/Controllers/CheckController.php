<?php

namespace App\Http\Controllers;

use App\Mail\CheckCompletedMail;
use App\Models\Check;
use App\Models\CheckItem;
use App\Models\Location;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CheckController extends Controller
{
    public function show(Location $location)
    {
        if (!$location->is_active) {
            abort(404);
        }

        $items           = $location->items;
        $groups          = $location->groups()->with('items')->get();
        $ungroupedItems  = $location->items()->whereNull('group_id')->get();

        return view('check.show', compact('location', 'items', 'groups', 'ungroupedItems'));
    }

    public function store(Request $request, Location $location)
    {
        $validated = $request->validate([
            'extra_email' => 'nullable|email|max:255',
            'notes'       => 'nullable|string|max:1000',
            'items'       => 'nullable|array',
            'items.*'     => 'boolean',
        ]);

        $check = Check::create([
            'location_id' => $location->id,
            'checked_by'  => auth('tenant')->user()->name,
            'extra_email' => $validated['extra_email'] ?? null,
            'notes'       => $validated['notes'] ?? null,
        ]);

        foreach ($location->items as $item) {
            CheckItem::create([
                'check_id'   => $check->id,
                'item_id'    => $item->id,
                'is_checked' => isset($validated['items'][$item->id]),
            ]);
        }

        $check->load('checkItems.item', 'location.groups');

        $recipients = [];
        $fixEmail = Setting::get('global_email');
        if ($fixEmail) {
            $recipients[] = $fixEmail;
        }
        if ($location->email) {
            $recipients[] = $location->email;
        }
        if (!empty($validated['extra_email'])) {
            $recipients[] = $validated['extra_email'];
        }

        $recipients = array_unique(array_filter($recipients));

        if (!empty($recipients)) {
            foreach ($recipients as $recipient) {
                Mail::to($recipient)->send(new CheckCompletedMail($check));
            }
        }

        return redirect()->route('home')->with('success', "Az ellenőrzés sikeresen rögzítve és elküldve! ({$location->name})");
    }
}

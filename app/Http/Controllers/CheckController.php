<?php

namespace App\Http\Controllers;

use App\Mail\CheckCompletedMail;
use App\Models\ActivityLog;
use App\Models\Check;
use App\Models\CheckItem;
use App\Models\Location;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

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

        return Inertia::render('Check/Show', ['location' => $location, 'groups' => $groups, 'ungroupedItems' => $ungroupedItems]);
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
            'user_id'     => auth('tenant')->id(),
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

        $checkedCount = $check->checkItems->where('is_checked', true)->count();
        $totalCount   = $check->checkItems->count();
        ActivityLog::record('check.completed', Auth::guard('tenant')->user(),
            "Ellenőrzés: {$location->name} – {$checkedCount}/{$totalCount} tétel", [
                'check_id'    => $check->id,
                'location_id' => $location->id,
                'checked'     => $checkedCount,
                'total'       => $totalCount,
            ]);

        return redirect()->route('checks.show', $check)
            ->with('success', "Ellenőrzés rögzítve! ({$location->name})");
    }

    public function showResult(Check $check)
    {
        $authUser = Auth::guard('tenant')->user();

        abort_if(
            !$authUser->isAdmin()
                && !$authUser->isPropertyManager()
                && $authUser->id !== $check->user_id,
            403
        );

        $check->load(['checkItems.item.group', 'location']);

        $groupedCheckItems   = $check->checkItems
            ->filter(fn($ci) => $ci->item->group_id !== null)
            ->groupBy(fn($ci) => $ci->item->group->name ?? 'Egyéb');
        $ungroupedCheckItems = $check->checkItems
            ->filter(fn($ci) => $ci->item->group_id === null);

        return Inertia::render('Check/Result', ['check' => $check, 'groupedCheckItems' => $groupedCheckItems, 'ungroupedCheckItems' => $ungroupedCheckItems]);
    }

    public function editResult(Check $check)
    {
        $authUser = Auth::guard('tenant')->user();
        abort_if(
            !$authUser->isAdmin() && ($authUser->isPropertyManager() || $authUser->id !== $check->user_id),
            403
        );

        $check->load(['checkItems.item.group', 'location']);

        $groupedCheckItems   = $check->checkItems
            ->filter(fn($ci) => $ci->item->group_id !== null)
            ->groupBy(fn($ci) => $ci->item->group->name ?? 'Egyéb');
        $ungroupedCheckItems = $check->checkItems
            ->filter(fn($ci) => $ci->item->group_id === null);

        return Inertia::render('Check/Edit', ['check' => $check, 'groupedCheckItems' => $groupedCheckItems, 'ungroupedCheckItems' => $ungroupedCheckItems]);
    }

    public function updateResult(Request $request, Check $check)
    {
        $authUser = Auth::guard('tenant')->user();
        abort_if(
            !$authUser->isAdmin() && ($authUser->isPropertyManager() || $authUser->id !== $check->user_id),
            403
        );

        $validated = $request->validate([
            'notes'       => 'nullable|string|max:1000',
            'extra_email' => 'nullable|email|max:255',
            'items'       => 'nullable|array',
        ]);

        $check->update([
            'notes'       => $validated['notes'] ?? null,
            'extra_email' => $validated['extra_email'] ?? null,
        ]);

        foreach ($check->checkItems as $checkItem) {
            $checkItem->update([
                'is_checked' => isset($validated['items'][$checkItem->item_id]),
            ]);
        }

        return redirect()->route('checks.show', $check)
            ->with('success', 'Az ellenőrzés sikeresen módosítva.');
    }
}

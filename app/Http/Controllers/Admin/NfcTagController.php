<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\NfcTag;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class NfcTagController extends Controller
{
    public function index()
    {
        $tags = NfcTag::with('location:id,name')->orderBy('label')->orderBy('uid')->get();
        return Inertia::render('Admin/NfcTags/Index', ['tags' => $tags]);
    }

    public function create()
    {
        return Inertia::render('Admin/NfcTags/Form', [
            'tag'       => null,
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'uid'         => ['required', 'string', 'max:255', Rule::unique(NfcTag::class)],
            'location_id' => 'required|integer|exists:tenant.locations,id',
            'label'       => 'nullable|string|max:255',
            'is_active'   => 'boolean',
        ]);

        NfcTag::create([
            'uid'         => $validated['uid'],
            'location_id' => $validated['location_id'],
            'label'       => $validated['label'] ?? null,
            'is_active'   => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.nfc-tags.index')->with('success', 'NFC matrica felvéve!');
    }

    public function edit(NfcTag $nfcTag)
    {
        return Inertia::render('Admin/NfcTags/Form', [
            'tag'       => $nfcTag,
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, NfcTag $nfcTag)
    {
        $validated = $request->validate([
            'uid'         => ['required', 'string', 'max:255', Rule::unique(NfcTag::class)->ignore($nfcTag->id)],
            'location_id' => 'required|integer|exists:tenant.locations,id',
            'label'       => 'nullable|string|max:255',
            'is_active'   => 'boolean',
        ]);

        $nfcTag->update([
            'uid'         => $validated['uid'],
            'location_id' => $validated['location_id'],
            'label'       => $validated['label'] ?? null,
            'is_active'   => $request->boolean('is_active', false),
        ]);

        return redirect()->route('admin.nfc-tags.index')->with('success', 'NFC matrica frissítve!');
    }

    public function destroy(NfcTag $nfcTag)
    {
        $nfcTag->delete();
        return redirect()->route('admin.nfc-tags.index')->with('success', 'NFC matrica törölve!');
    }
}

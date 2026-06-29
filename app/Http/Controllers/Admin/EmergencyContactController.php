<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmergencyContact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmergencyContactController extends Controller
{
    public function index()
    {
        $contacts = EmergencyContact::orderBy('category')->orderBy('sort_order')->orderBy('name')->get();
        return Inertia::render('Admin/EmergencyContacts/Index', ['contacts' => $contacts]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category'   => 'required|string|max:100',
            'name'       => 'required|string|max:200',
            'phone'      => 'nullable|string|max:50',
            'note'       => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        EmergencyContact::create($request->only('category', 'name', 'phone', 'note', 'sort_order'));

        return back()->with('success', 'Kapcsolat hozzáadva.');
    }

    public function update(Request $request, EmergencyContact $emergencyContact)
    {
        $request->validate([
            'category'   => 'required|string|max:100',
            'name'       => 'required|string|max:200',
            'phone'      => 'nullable|string|max:50',
            'note'       => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $emergencyContact->update($request->only('category', 'name', 'phone', 'note', 'sort_order'));

        return back()->with('success', 'Kapcsolat módosítva.');
    }

    public function destroy(EmergencyContact $emergencyContact)
    {
        $emergencyContact->delete();
        return back()->with('success', 'Kapcsolat törölve.');
    }
}

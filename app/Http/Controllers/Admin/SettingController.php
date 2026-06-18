<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingController extends Controller
{
    public function edit()
    {
        $globalEmail = Setting::get('global_email', '');
        return view('admin.settings', compact('globalEmail'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'global_email'    => 'nullable|email|max:255',
            'new_password'    => 'nullable|string|min:6|confirmed',
        ]);

        Setting::set('global_email', $request->input('global_email', ''));

        if ($request->filled('new_password')) {
            Setting::set('admin_password_hash', Hash::make($request->new_password));
        }

        return back()->with('success', 'Beállítások mentve!');
    }
}

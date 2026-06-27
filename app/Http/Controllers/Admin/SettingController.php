<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function edit()
    {
        return Inertia::render('Admin/Settings', [
            'globalEmail'                 => Setting::get('global_email', ''),
            'trainingNotificationEmail'   => Setting::get('training_notification_email', ''),
            'securityNotificationEmail'   => Setting::get('security_notification_email', ''),
            'securityModuleVisible'       => Setting::get('security_module_visible', '1') === '1',
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'global_email'                => 'nullable|email|max:255',
            'training_notification_email' => 'nullable|email|max:255',
            'security_notification_email' => 'nullable|string|max:1000',
            'new_password'                => 'nullable|string|min:6|confirmed',
            'security_module_visible'     => 'boolean',
        ]);

        Setting::set('global_email', $request->input('global_email', ''));
        Setting::set('training_notification_email', $request->input('training_notification_email', ''));
        Setting::set('security_notification_email', $request->input('security_notification_email', ''));
        Setting::set('security_module_visible', $request->boolean('security_module_visible') ? '1' : '0');

        if ($request->filled('new_password')) {
            Setting::set('admin_password_hash', Hash::make($request->new_password));
        }

        return back()->with('success', 'Beállítások mentve!');
    }
}

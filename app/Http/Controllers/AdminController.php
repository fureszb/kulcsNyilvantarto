<?php

namespace App\Http\Controllers;

use App\Models\Check;
use App\Models\Location;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function login()
    {
        $tenant = app('tenant');
        if (session('admin_' . $tenant->slug)) {
            return redirect()->route('admin.dashboard');
        }
        return view('admin.login');
    }

    public function authenticate(Request $request)
    {
        $request->validate(['password' => 'required|string']);

        $tenant      = app('tenant');
        $sessionKey  = 'admin_' . $tenant->slug;
        $storedHash  = Setting::get('admin_password_hash');

        if (!$storedHash) {
            Setting::set('admin_password_hash', Hash::make($request->password));
            session([$sessionKey => true]);
            return redirect()->route('admin.dashboard')
                ->with('success', 'Admin jelszó beállítva és bejelentkezve!');
        }

        if (Hash::check($request->password, $storedHash)) {
            session([$sessionKey => true]);
            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors(['password' => 'Hibás jelszó.']);
    }

    public function logout(Request $request)
    {
        $tenant = app('tenant');
        $request->session()->forget('admin_' . $tenant->slug);
        return redirect()->route('admin.login');
    }

    public function dashboard()
    {
        $stats = [
            'locations'    => Location::count(),
            'checks_today' => Check::whereDate('created_at', today())->count(),
            'checks_total' => Check::count(),
        ];

        $recentChecks = Check::with('location')
            ->withCount(['checkItems', 'checkItems as checked_count' => fn($q) => $q->where('is_checked', true)])
            ->latest()
            ->limit(5)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentChecks'));
    }
}

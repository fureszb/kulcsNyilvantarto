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
        if (session('admin_authenticated')) {
            return redirect()->route('admin.dashboard');
        }
        return view('admin.login');
    }

    public function authenticate(Request $request)
    {
        $request->validate(['password' => 'required|string']);

        $storedHash = Setting::get('admin_password_hash');

        if (!$storedHash) {
            // First run: any password sets it
            Setting::set('admin_password_hash', Hash::make($request->password));
            session(['admin_authenticated' => true]);
            return redirect()->route('admin.dashboard')->with('success', 'Admin jelszó beállítva és bejelentkezve!');
        }

        if (Hash::check($request->password, $storedHash)) {
            session(['admin_authenticated' => true]);
            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors(['password' => 'Hibás jelszó.']);
    }

    public function logout(Request $request)
    {
        $request->session()->forget('admin_authenticated');
        return redirect()->route('admin.login');
    }

    public function dashboard()
    {
        $stats = [
            'locations' => Location::count(),
            'checks_today' => Check::whereDate('created_at', today())->count(),
            'checks_total' => Check::count(),
        ];
        return view('admin.dashboard', compact('stats'));
    }
}

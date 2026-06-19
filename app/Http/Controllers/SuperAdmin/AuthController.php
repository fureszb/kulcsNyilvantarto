<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (session('super_admin_authenticated')) {
            return redirect()->route('super-admin.dashboard');
        }
        return view('super-admin.login');
    }

    public function login(Request $request)
    {
        $request->validate(['password' => 'required']);

        $configured = env('SUPER_ADMIN_PASSWORD');

        if ($configured && $request->password === $configured) {
            session(['super_admin_authenticated' => true]);
            return redirect()->route('super-admin.dashboard');
        }

        return back()->withErrors(['password' => 'Hibás jelszó.']);
    }

    public function logout(Request $request)
    {
        $request->session()->forget('super_admin_authenticated');
        return redirect()->route('super-admin.login');
    }
}

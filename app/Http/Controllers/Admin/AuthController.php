<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLogin()
    {
        $tenant = app()->bound('tenant') ? app('tenant') : null;
        if (Auth::guard('tenant')->check() && session('auth_tenant') === optional($tenant)->slug) {
            return redirect()->route('admin.dashboard');
        }
        return view('admin.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $tenant = app()->bound('tenant') ? app('tenant') : null;

        if (Auth::guard('tenant')->attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $user = Auth::guard('tenant')->user();

            if (!$user->isAdmin()) {
                Auth::guard('tenant')->logout();
                return back()->withErrors(['email' => 'Nincs admin jogosultsága.'])->onlyInput('email');
            }

            if (!$user->is_active) {
                Auth::guard('tenant')->logout();
                return back()->withErrors(['email' => 'Fiókja inaktív.'])->onlyInput('email');
            }

            $request->session()->regenerate();
            session(['auth_tenant' => optional($tenant)->slug]);
            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors(['email' => 'Hibás email cím vagy jelszó.'])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::guard('tenant')->logout();
        $request->session()->forget('auth_tenant');
        $request->session()->regenerateToken();
        return redirect()->route('admin.login');
    }
}

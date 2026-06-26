<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TenantUserAuthController extends Controller
{
    public function showLogin()
    {
        $tenant = app()->bound('tenant') ? app('tenant') : null;
        if (Auth::guard('tenant')->check() && session('auth_tenant') === optional($tenant)->slug) {
            $user = Auth::guard('tenant')->user();
            return $user->isPropertyManager()
                ? redirect()->route('pm.dashboard')
                : redirect()->route('home');
        }
        return Inertia::render('Auth/Login');
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

            if (!$user->is_active) {
                Auth::guard('tenant')->logout();
                return back()->withErrors(['email' => 'Fiókja inaktív. Vegye fel a kapcsolatot az adminisztrátorral.'])->onlyInput('email');
            }

            $request->session()->regenerate();
            session(['auth_tenant' => optional($tenant)->slug]);

            ActivityLog::record('user.login', $user, "{$user->name} bejelentkezett");

            if ($user->isPropertyManager()) {
                session(['pm_welcome' => $user->name]);
                return redirect()->route('pm.dashboard');
            }

            session(['user_welcome' => $user->name]);
            return redirect()->intended(route('home'));
        }

        return back()->withErrors(['email' => 'Hibás email cím vagy jelszó.'])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        $user = Auth::guard('tenant')->user();
        if ($user) {
            ActivityLog::record('user.logout', $user, "{$user->name} kijelentkezett");
        }
        Auth::guard('tenant')->logout();
        $request->session()->forget('auth_tenant');
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}

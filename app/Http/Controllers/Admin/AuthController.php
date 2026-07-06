<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Admin kijelentkezés. A belépés a közös /login oldalon történik
     * (a szerepkör-alapú átirányítás viszi az admint a dashboardra),
     * ezért az admin kijelentkezés is a közös login oldalra terel.
     */
    public function logout(Request $request)
    {
        Auth::guard('tenant')->logout();
        $request->session()->forget('auth_tenant');
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}

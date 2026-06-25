<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PropertyManagerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = app()->bound('tenant') ? app('tenant') : null;

        if (!Auth::guard('tenant')->check()) {
            return redirect()->route('login');
        }

        if (session('auth_tenant') !== optional($tenant)->slug) {
            Auth::guard('tenant')->logout();
            return redirect()->route('login');
        }

        $user = Auth::guard('tenant')->user();

        if (!$user->is_active) {
            Auth::guard('tenant')->logout();
            return redirect()->route('login')->with('error', 'Fiókja inaktív.');
        }

        if (!$user->canManage()) {
            abort(403, 'Nincs jogosultsága ehhez az oldalhoz.');
        }

        return $next($request);
    }
}

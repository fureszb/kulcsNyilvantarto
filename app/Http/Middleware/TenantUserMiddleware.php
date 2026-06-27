<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TenantUserMiddleware
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
            return redirect()->route('login')->with('error', 'Fiókja inaktív. Vegye fel a kapcsolatot az adminisztrátorral.');
        }

        if ($user->isPropertyManager()) {
            return redirect()->route('pm.dashboard');
        }

        return $next($request);
    }
}

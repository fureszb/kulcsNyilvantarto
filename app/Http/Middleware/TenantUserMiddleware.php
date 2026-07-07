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

        // A PM és a területi igazgató saját, dedikált portállal rendelkezik — ha a
        // generikus dolgozói kezdőlapra (`home`) tévednek, oda irányítjuk őket.
        // A többi MEGOSZTOTT tenant-user route-ot (Vezénylés, Váltóüzenetek, AI,
        // PM üzenetek, profil) viszont minden szerepkör (biztonsági vezető,
        // igazgató, dolgozó) szabadon elérheti — ott nem szabad elterelni, mert
        // különben ezek a menüpontok a saját dashboardra pattannak vissza.
        if ($request->route()?->named('home')) {
            if ($user->isPropertyManager()) {
                return redirect()->route('pm.dashboard');
            }
            if ($user->isAreaDirector()) {
                return redirect()->route('director.dashboard');
            }
        }

        return $next($request);
    }
}

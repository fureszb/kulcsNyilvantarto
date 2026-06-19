<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('tenant');

        $tenant = Tenant::where('slug', $slug)->where('is_active', true)->first();

        if (!$tenant) {
            abort(404, 'Ismeretlen vagy inaktív cég.');
        }

        $dbPath = database_path('tenants/' . $slug . '.sqlite');

        if (!file_exists($dbPath)) {
            abort(503, 'Az adatbázis nem érhető el. Vegye fel a kapcsolatot az adminisztrátorral.');
        }

        config(['database.connections.tenant.database' => $dbPath]);
        DB::purge('tenant');

        app()->instance('tenant', $tenant);
        URL::defaults(['tenant' => $slug]);

        // Töröljük a {tenant} paramétert, hogy ne zavarja a controller
        // method injection-t (pl. show(Location $location) ne kapja meg
        // a 'demo' stringet első argumentumként).
        $request->route()->forgetParameter('tenant');

        return $next($request);
    }
}

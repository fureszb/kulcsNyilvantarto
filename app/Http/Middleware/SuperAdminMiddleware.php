<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!session('super_admin_authenticated')) {
            return redirect()->route('super-admin.login');
        }

        return $next($request);
    }
}

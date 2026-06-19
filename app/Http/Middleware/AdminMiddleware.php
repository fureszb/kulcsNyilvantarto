<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = app()->bound('tenant') ? app('tenant') : null;
        $sessionKey = $tenant ? 'admin_' . $tenant->slug : 'admin_authenticated';

        if (!session($sessionKey)) {
            return redirect()->route('admin.login');
        }

        return $next($request);
    }
}

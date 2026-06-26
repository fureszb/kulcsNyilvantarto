<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'admin'            => \App\Http\Middleware\AdminMiddleware::class,
            'tenant'           => \App\Http\Middleware\TenantMiddleware::class,
            'super-admin'      => \App\Http\Middleware\SuperAdminMiddleware::class,
            'tenant-user'      => \App\Http\Middleware\TenantUserMiddleware::class,
            'property-manager' => \App\Http\Middleware\PropertyManagerMiddleware::class,
        ]);

        // TenantMiddleware-nek a SubstituteBindings előtt kell futnia,
        // különben a route model binding ({location} → Location::find())
        // üres tenant connection-t talál.
        $middleware->priority([
            \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class,
            \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
            \Illuminate\Contracts\Session\Middleware\AuthenticatesSessions::class,
            \App\Http\Middleware\TenantMiddleware::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Auth\Middleware\Authorize::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (
            \Symfony\Component\HttpFoundation\Response $response,
            \Throwable $e,
            \Illuminate\Http\Request $request
        ) {
            if (
                in_array($response->getStatusCode(), [403, 404, 405])
                && ! $request->expectsJson()
            ) {
                return \Inertia\Inertia::render('Error', [
                    'status' => $response->getStatusCode(),
                ])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
    })->create();

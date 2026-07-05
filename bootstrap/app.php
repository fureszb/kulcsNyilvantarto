<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\NoStoreHtmlDocuments::class,
        ]);

        $middleware->trustProxies(at: '*');

        $middleware->validateCsrfTokens(except: [
            '*/broadcasting/auth',
        ]);

        $middleware->alias([
            'admin'            => \App\Http\Middleware\AdminMiddleware::class,
            'tenant'           => \App\Http\Middleware\TenantMiddleware::class,
            'super-admin'      => \App\Http\Middleware\SuperAdminMiddleware::class,
            'tenant-user'      => \App\Http\Middleware\TenantUserMiddleware::class,
            'property-manager' => \App\Http\Middleware\PropertyManagerMiddleware::class,
            'area-director'    => \App\Http\Middleware\AreaDirectorMiddleware::class,
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
        // render() korábban fut — TokenMismatchException itt kezelhető megbízhatóan
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if (! ($e instanceof \Illuminate\Session\TokenMismatchException)) {
                return null;
            }
            // Login form POST: session lejárt közben → redirect a login oldalra hibaüzenettel
            if ($request->isMethod('POST') && $request->is('*/login')) {
                return redirect($request->url())
                    ->with('error', 'A munkamenet lejárt. Kérem próbálkozzon újra.');
            }
            if ($request->header('X-Inertia')) {
                // Full-page reload session-írás nélkül (session lehet sérült)
                return \Inertia\Inertia::location(url()->previous() ?: '/');
            }
            if (! $request->expectsJson()) {
                return \Inertia\Inertia::render('Error', ['status' => 419])
                    ->toResponse($request)
                    ->setStatusCode(419);
            }
            return null;
        });

        // respond() a már generált response status code alapján kezeli a többi HTTP hibát
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

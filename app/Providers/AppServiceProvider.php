<?php

namespace App\Providers;

use App\Models\TenantPersonalAccessToken;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (app()->environment('production')) {
            $scheme = parse_url(config('app.url'), PHP_URL_SCHEME) ?? 'https';
            URL::forceScheme($scheme);
        }

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        Sanctum::usePersonalAccessTokenModel(TenantPersonalAccessToken::class);

        // A mobil API (App\Http\Resources\Api\*) minden Resource-ja nyers alakot ad vissza
        // "data" kulcsú becsomagolás nélkül — a Kotlin kliens ezt feltételezi mindenhol,
        // ugyanúgy, ahogy a kézzel épített response()->json([...]) végpontok sem
        // csomagolnak be semmit. Ez a Resource osztályok kizárólag az Api namespace-ben
        // élnek (nincs web/Inertia-oldali használatuk), tehát globálisan biztonságos kikapcsolni.
        JsonResource::withoutWrapping();
    }
}

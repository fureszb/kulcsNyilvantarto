<?php

namespace App\Providers;

use App\Models\TenantPersonalAccessToken;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
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
    }
}

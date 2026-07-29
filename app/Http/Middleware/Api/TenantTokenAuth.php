<?php

namespace App\Http\Middleware\Api;

use App\Models\TenantPersonalAccessToken;
use App\Models\TenantUser;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Kézzel oldja fel a Sanctum bearer tokent, miután a TenantMiddleware már
 * beállította a tenant DB connectiont. Szándékosan NEM a beépített
 * `auth:sanctum` middleware-t használjuk, mert az a globális
 * $middlewarePriority listában a TenantMiddleware ELÉ sorolódna
 * (lásd bootstrap/app.php), ami a tenant-connection beállítása előtt
 * próbálná feloldani a tokent.
 */
class TenantTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        $accessToken = $token ? TenantPersonalAccessToken::findToken($token) : null;

        if (!$accessToken || !$accessToken->tokenable instanceof TenantUser) {
            abort(401, 'Érvénytelen vagy hiányzó token.');
        }

        $user = $accessToken->tokenable;

        if (!$user->is_active) {
            abort(403, 'Fiók inaktív.');
        }

        $accessToken->forceFill(['last_used_at' => now()])->save();
        $user->withAccessToken($accessToken);

        Auth::guard('tenant')->setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}

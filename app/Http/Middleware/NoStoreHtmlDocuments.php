<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A HTML dokumentum-válaszokat (a Vite asset-hasheket hivatkozó Inertia
 * oldalakat) tiltja a böngésző- és proxy-cache-elésből.
 *
 * Enélkül egy régi deploy HTML-je a böngésző HTTP-cache-éből jöhet, halott
 * asset-hashekkel; az azokra mutató lazy chunkok 404-et adnak → a React nem
 * mountol → sötét képernyő, amit csak kézi cache-ürítés old meg.
 *
 * Csak a text/html dokumentumokra hat, és nem írja felül, ha egy válasz már
 * explicit Cache-Control-t állított (pl. a /stream/{path} media-route).
 */
class NoStoreHtmlDocuments
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethod('GET')) {
            return $response;
        }

        $contentType = (string) $response->headers->get('Content-Type', '');
        if (! str_contains($contentType, 'text/html')) {
            return $response;
        }

        // A route/válasz által már beállított explicit cache-szabályt tiszteljük
        $existing = (string) $response->headers->get('Cache-Control', '');
        if ($existing !== '' && ! str_contains($existing, 'no-cache') && ! str_contains($existing, 'private')) {
            return $response;
        }

        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');

        return $response;
    }
}

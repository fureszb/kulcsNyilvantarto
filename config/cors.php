<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Ez a fájl korábban hiányzott a projektből, ezért az Illuminate\Http\
    | Middleware\HandleCors (globálisan regisztrálva, lásd bootstrap/app.php
    | Foundation\Configuration\Middleware defaultjai) `config('cors.paths', [])`
    | üres tömböt kapott — SOHA nem illesztett egyetlen útvonalra sem, tehát
    | SOHA nem adott Access-Control-Allow-Origin headert. Ez minden
    | cross-origin kérést (a mobil Capacitor app dev-szerverét, és a natív
    | app WebView-ját is, ami más originnek számít, mint ez a backend)
    | némán blokkolt böngésző-oldalon, HOLOTT a szerver ténylegesen fogadta
    | és feldolgozta a kérést (lásd a Laravel dev-szerver logját).
    |
    | Csak a `routes/api.php` (mobil/natív kliens) útvonalaira vonatkozik —
    | a `routes/web.php` (Inertia SPA) same-origin marad, azt NEM kell
    | CORS-engedélyezni.
    |
    | Bearer-token autentikáció (nem session-cookie), ezért
    | supports_credentials = false marad — nincs cookie-alapú CSRF-kockázat,
    | amit a CORS itt védene.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_merge(
        [
            // Capacitor WebView natív origin-jei (Android/iOS)
            'capacitor://localhost',
            'ionic://localhost',
            'http://localhost',
            'https://localhost',
        ],
        explode(',', env('CORS_ADDITIONAL_ORIGINS', '')),
    )),

    'allowed_origins_patterns' => [
        // Helyi fejlesztői Vite szerverek (bármelyik port), pl. http://localhost:5180
        '#^https?://localhost:\d+$#',
        '#^https?://127\.0\.0\.1:\d+$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];

<?php

return [

    'default' => env('BROADCAST_CONNECTION', 'null'),

    'connections' => [

        'reverb' => [
            'driver'     => 'reverb',
            'app_id'     => env('REVERB_APP_ID'),
            'app_key'    => env('REVERB_APP_KEY'),
            'app_secret' => env('REVERB_APP_SECRET'),
            'options'    => [
                // PHP → Reverb belső kapcsolat (nincs TLS, közvetlen 8080)
                'host'   => env('REVERB_SERVER_HOST', '127.0.0.1'),
                'port'   => env('REVERB_SERVER_PORT', 8080),
                'scheme' => 'http',
                'useTLS' => false,
            ],
        ],

        'pusher' => [
            'driver' => 'pusher',
            'key'    => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'useTLS'  => true,
            ],
        ],

        'log'  => ['driver' => 'log'],
        'null' => ['driver' => 'null'],

    ],
];

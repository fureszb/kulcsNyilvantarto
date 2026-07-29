<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'rag' => [
        'url' => env('RAG_SERVICE_URL', 'http://127.0.0.1:8100'),
        'token' => env('RAG_INTERNAL_TOKEN'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Natív mobil push (Android/iOS) — a mobil kliens device-tokenjeihez.
    // Amíg a *_CREDENTIALS_PATH env változó nincs beállítva, a küldés
    // csendben kihagyásra kerül (lásd App\Services\FcmPushService /
    // ApnsPushService) — a subscribe-native/unsubscribe-native végpontok
    // enélkül is működnek, csak a tényleges kézbesítés vár a hitelesítő
    // adatokra.
    'fcm' => [
        'project_id' => env('FCM_PROJECT_ID'),
        'credentials_path' => env('FCM_CREDENTIALS_PATH'),
    ],

    'apns' => [
        'key_id' => env('APNS_KEY_ID'),
        'team_id' => env('APNS_TEAM_ID'),
        'bundle_id' => env('APNS_BUNDLE_ID'),
        'key_path' => env('APNS_KEY_PATH'),
        'production' => env('APNS_PRODUCTION', false),
    ],

];

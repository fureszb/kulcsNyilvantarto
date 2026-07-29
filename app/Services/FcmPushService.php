<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Android natív push az FCM HTTP v1 API-n keresztül, service-account
 * hitelesítéssel (JSON kulcsfájl, `FCM_CREDENTIALS_PATH` env). Nem igényel
 * új Composer-függőséget — az OAuth2 JWT-t (RS256) natív `openssl_sign`-nal
 * írjuk alá, ugyanaz az elv, mint a projekt többi widgetjénél (meglévő
 * eszközökkel, új library nélkül).
 *
 * FONTOS: ez a service valós Firebase service-account JSON nélkül nem
 * tesztelhető — amíg a FCM_CREDENTIALS_PATH env nincs beállítva, send()
 * csendben, logolva kihagyja a küldést (nem dobja el a hívó jobot).
 */
class FcmPushService
{
    public function send(string $deviceToken, string $title, string $body, array $data = []): bool
    {
        $credentialsPath = config('services.fcm.credentials_path');
        $projectId = config('services.fcm.project_id');

        if (!$credentialsPath || !$projectId || !is_file($credentialsPath)) {
            Log::info('FCM push kihagyva: nincs beállítva FCM_CREDENTIALS_PATH/FCM_PROJECT_ID.');
            return false;
        }

        $accessToken = $this->getAccessToken($credentialsPath);
        if (!$accessToken) {
            return false;
        }

        $response = Http::withToken($accessToken)
            ->timeout(15)
            ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", [
                'message' => [
                    'token' => $deviceToken,
                    'notification' => ['title' => $title, 'body' => $body],
                    'data' => array_map('strval', $data),
                ],
            ]);

        if ($response->failed()) {
            Log::warning('FCM push küldés sikertelen: ' . $response->body());
            return false;
        }

        return true;
    }

    private function getAccessToken(string $credentialsPath): ?string
    {
        return Cache::remember('fcm_access_token', 3500, function () use ($credentialsPath) {
            $credentials = json_decode(file_get_contents($credentialsPath), true);
            if (!is_array($credentials) || empty($credentials['private_key']) || empty($credentials['client_email'])) {
                Log::error('FCM service-account JSON érvénytelen vagy hiányos.');
                return null;
            }

            $now = time();
            $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $claims = $this->base64UrlEncode(json_encode([
                'iss'   => $credentials['client_email'],
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud'   => 'https://oauth2.googleapis.com/token',
                'exp'   => $now + 3600,
                'iat'   => $now,
            ]));

            $signatureInput = "{$header}.{$claims}";
            $signature = '';
            $signed = openssl_sign($signatureInput, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256);
            if (!$signed) {
                Log::error('FCM JWT aláírás sikertelen.');
                return null;
            }

            $jwt = "{$signatureInput}." . $this->base64UrlEncode($signature);

            $tokenResponse = Http::asForm()->timeout(15)->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion'  => $jwt,
            ]);

            if ($tokenResponse->failed()) {
                Log::error('FCM OAuth2 token csere sikertelen: ' . $tokenResponse->body());
                return null;
            }

            return $tokenResponse->json('access_token');
        });
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}

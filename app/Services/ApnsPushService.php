<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * iOS natív push az APNs HTTP/2 API-n (token-alapú hitelesítés, .p8 kulcs).
 * Ugyanaz az elv, mint az FcmPushService-nél: natív openssl-lel aláírt
 * JWT (ES256), új Composer-függőség nélkül.
 *
 * ⚠️ EZ A SERVICE VALÓS APNS AUTH KEY (.p8) NÉLKÜL NEM TESZTELHETŐ ebben a
 * sandboxban — az ES256 JWT aláírás (DER → raw R||S konverzió) és a
 * HTTP/2 kapcsolat (a Laravel Http kliens Guzzle/cURL rétegének HTTP/2
 * támogatásától függ, ami a célszerver konfigurációjától is függ) az
 * ELSŐ éles iOS push-küldésnél mindenképp ellenőrizendő.
 */
class ApnsPushService
{
    public function send(string $deviceToken, string $title, string $body, array $data = []): bool
    {
        $keyId = config('services.apns.key_id');
        $teamId = config('services.apns.team_id');
        $bundleId = config('services.apns.bundle_id');
        $keyPath = config('services.apns.key_path');

        if (!$keyId || !$teamId || !$bundleId || !$keyPath || !is_file($keyPath)) {
            Log::info('APNs push kihagyva: nincs beállítva APNS_KEY_ID/TEAM_ID/BUNDLE_ID/KEY_PATH.');
            return false;
        }

        $jwt = $this->getProviderToken($keyId, $teamId, $keyPath);
        if (!$jwt) {
            return false;
        }

        $host = config('services.apns.production')
            ? 'https://api.push.apple.com'
            : 'https://api.sandbox.push.apple.com';

        $response = Http::withToken($jwt)
            ->withHeaders([
                'apns-topic'    => $bundleId,
                'apns-push-type' => 'alert',
            ])
            ->withOptions(['version' => 2.0])
            ->timeout(15)
            ->post("{$host}/3/device/{$deviceToken}", [
                'aps'  => ['alert' => ['title' => $title, 'body' => $body], 'sound' => 'default'],
                'data' => $data,
            ]);

        if ($response->failed()) {
            Log::warning('APNs push küldés sikertelen: ' . $response->status() . ' ' . $response->body());
            return false;
        }

        return true;
    }

    private function getProviderToken(string $keyId, string $teamId, string $keyPath): ?string
    {
        $cacheKey = "apns_provider_token_{$keyId}";

        return Cache::remember($cacheKey, 3000, function () use ($keyId, $teamId, $keyPath) {
            $privateKey = openssl_pkey_get_private(file_get_contents($keyPath));
            if (!$privateKey) {
                Log::error('APNs .p8 kulcs betöltése sikertelen.');
                return null;
            }

            $header = $this->base64UrlEncode(json_encode(['alg' => 'ES256', 'kid' => $keyId]));
            $claims = $this->base64UrlEncode(json_encode(['iss' => $teamId, 'iat' => time()]));
            $signatureInput = "{$header}.{$claims}";

            $derSignature = '';
            $signed = openssl_sign($signatureInput, $derSignature, $privateKey, OPENSSL_ALGO_SHA256);
            if (!$signed) {
                Log::error('APNs JWT aláírás sikertelen.');
                return null;
            }

            $rawSignature = $this->derToRawEcdsaSignature($derSignature, 32);

            return "{$signatureInput}." . $this->base64UrlEncode($rawSignature);
        });
    }

    /** ES256 JWT-hez az openssl DER-kódolású ECDSA aláírását R||S raw formátumra alakítja. */
    private function derToRawEcdsaSignature(string $der, int $partLength): string
    {
        // DER SEQUENCE(0x30) len [INTEGER(0x02) len r] [INTEGER(0x02) len s]
        $offset = 2; // skip SEQUENCE tag + length byte(s) - assumes short-form length (< 128 bytes), true for P-256
        if ((ord($der[1]) & 0x80) !== 0) {
            $offset = 2 + (ord($der[1]) & 0x7F);
        }

        $extractInt = function (string $der, int &$offset) use ($partLength) {
            $offset++; // skip INTEGER tag (0x02)
            $len = ord($der[$offset]);
            $offset++;
            $value = substr($der, $offset, $len);
            $offset += $len;

            // DER INTEGER-ök vezető 0x00-t kapnak, ha a legmagasabb bit 1 lenne
            // (hogy pozitívnak számítson) — a raw formátumhoz ezt levágjuk,
            // majd a kívánt hosszra (32 byte P-256-nál) balról nullákkal töltjük.
            $value = ltrim($value, "\x00");
            return str_pad($value, $partLength, "\x00", STR_PAD_LEFT);
        };

        $r = $extractInt($der, $offset);
        $s = $extractInt($der, $offset);

        return $r . $s;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}

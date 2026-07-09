<?php

namespace App\Services;

use App\Models\DocumentSignature;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Aláírás-képek KIZÁRÓLAG ideiglenes tárolása: a fájl a lemezen csak addig él,
 * amíg a PDF el nem készül és a kép bele nem ágyazódik — utána purge()-öt kell
 * hívni rá, ami törli a fájlt és nullázza az adatbázis-oszlopot.
 */
class DocumentSignatureService
{
    public function storeTemp(string $base64DataUrl, string $tenantSlug, string $role): string
    {
        $binary = base64_decode(str_replace('data:image/png;base64,', '', $base64DataUrl));
        $path = "documents/{$tenantSlug}/signatures/tmp/" . Str::uuid() . '.png';

        Storage::disk('local')->put($path, $binary);

        return $path;
    }

    /** Törli a temp aláírás-fájlt a lemezről és nullázza a DB-referenciát. */
    public function purge(DocumentSignature $signature): void
    {
        if ($signature->signature_path) {
            Storage::disk('local')->delete($signature->signature_path);
        }

        $signature->update([
            'signature_path' => null,
            'embedded_at' => now(),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\Concerns;

/** Egy név (pl. "Szabó Tamás") kezdőbetűiből ("ST") képez rövid jelvény-feliratot — a
 *  dashboard widgetek (csapat jelenlét, üzenet-előnézetek) avatar-köreihez. */
trait FormatsInitials
{
    private function initialsOf(string $name): string
    {
        $parts = array_filter(explode(' ', trim($name)));
        $initials = array_map(fn ($p) => mb_strtoupper(mb_substr($p, 0, 1)), $parts);

        return implode('', array_slice($initials, 0, 2)) ?: '?';
    }
}

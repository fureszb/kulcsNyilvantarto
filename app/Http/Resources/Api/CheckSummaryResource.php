<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Könnyűsúlyú lista-nézet a saját ellenőrzés-előzményekhez (mobil "Ellenőrzéseim" képernyő) —
 * a teljes `CheckResource`-tól eltérően NEM ágyazza be a `check_items` tömböt (azt a
 * `withCount()` váltja ki a controllerben), hogy egy hosszú lista lapozása ne legyen felesleges
 * adatmennyiséggel terhelve.
 *
 * @mixin \App\Models\Check
 */
class CheckSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'location_id'   => $this->location_id,
            'location_name' => $this->whenLoaded('location', fn () => $this->location?->name),
            'checked_by'    => $this->checked_by,
            'checked_count' => (int) $this->checked_count,
            'total_count'   => (int) $this->total_count,
            'created_at'    => optional($this->created_at)->toIso8601String(),
        ];
    }
}

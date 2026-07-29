<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\TenantUser */
class TenantUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'role'              => $this->role,
            'is_active'         => $this->is_active,
            'employed_since'    => optional($this->employed_since)->toDateString(),
            'left_at'           => optional($this->left_at)->toDateString(),
            'location_id'       => $this->location_id,
            'director_id'       => $this->director_id,
            'notes_read_at'     => optional($this->notes_read_at)->toIso8601String(),
            'messages_read_at'  => optional($this->messages_read_at)->toIso8601String(),
        ];
    }
}

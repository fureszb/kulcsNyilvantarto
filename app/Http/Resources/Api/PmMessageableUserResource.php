<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\TenantUser */
class PmMessageableUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'   => $this->id,
            'name' => $this->name,
            'role' => $this->role,
        ];
    }
}

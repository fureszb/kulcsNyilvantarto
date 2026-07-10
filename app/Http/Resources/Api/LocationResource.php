<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Location */
class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'description'        => $this->description,
            'icon'               => $this->icon,
            'logo_path'          => $this->logo_path,
            'responsible_person' => $this->responsible_person,
            'email'              => $this->email,
            'is_active'          => $this->is_active,
            'security_lead_id'   => $this->security_lead_id,
        ];
    }
}

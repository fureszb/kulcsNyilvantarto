<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\EmergencyContact */
class EmergencyContactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'category'   => $this->category,
            'name'       => $this->name,
            'phone'      => $this->phone,
            'note'       => $this->note,
            'sort_order' => $this->sort_order,
        ];
    }
}

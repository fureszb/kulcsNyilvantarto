<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Item */
class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'location_id'=> $this->location_id,
            'group_id'   => $this->group_id,
            'name'       => $this->name,
            'type'       => $this->type,
            'sort_order' => $this->sort_order,
            'is_active'  => $this->is_active,
        ];
    }
}

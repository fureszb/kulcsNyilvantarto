<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ItemGroup */
class ItemGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'location_id' => $this->location_id,
            'name'        => $this->name,
            'sort_order'  => $this->sort_order,
            'items'       => ItemResource::collection($this->whenLoaded('items')),
        ];
    }
}

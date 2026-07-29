<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\CheckItem */
class CheckItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'check_id'   => $this->check_id,
            'item_id'    => $this->item_id,
            'is_checked' => $this->is_checked,
            'item'       => new ItemResource($this->whenLoaded('item')),
        ];
    }
}

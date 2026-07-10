<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Check */
class CheckResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'location_id' => $this->location_id,
            'user_id'     => $this->user_id,
            'checked_by'  => $this->checked_by,
            'extra_email' => $this->extra_email,
            'notes'       => $this->notes,
            'created_at'  => optional($this->created_at)->toIso8601String(),
            'check_items' => CheckItemResource::collection($this->whenLoaded('checkItems')),
        ];
    }
}

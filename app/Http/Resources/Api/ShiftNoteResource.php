<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ShiftNote */
class ShiftNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'user_id'     => $this->user_id,
            'author_name' => $this->user?->name,
            'location_id' => $this->location_id,
            'content'     => $this->content,
            'note_date'   => optional($this->note_date)->toDateString(),
            'created_at'  => optional($this->created_at)->toIso8601String(),
        ];
    }
}

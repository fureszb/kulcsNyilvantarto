<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\PmMessage */
class PmMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'content'          => $this->content,
            'send_to_all'      => $this->send_to_all,
            'sent_by_user_id'  => $this->sent_by_user_id,
            'sent_by_name'     => $this->sent_by_name,
            'created_at'       => optional($this->created_at)->toIso8601String(),
            'recipient_ids'    => $this->whenLoaded('recipients', fn () => $this->recipients->pluck('user_id')->values()),
            'replies'          => PmMessageReplyResource::collection($this->whenLoaded('replies')),
        ];
    }
}

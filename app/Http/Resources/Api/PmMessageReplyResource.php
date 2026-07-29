<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\PmMessageReply */
class PmMessageReplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'pm_message_id' => $this->pm_message_id,
            'sender_id'     => $this->sender_id,
            'sender_name'   => $this->sender_name,
            'content'       => $this->content,
            'created_at'    => optional($this->created_at)->toIso8601String(),
        ];
    }
}

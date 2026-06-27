<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PmMessageReply extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['pm_message_id', 'sender_id', 'sender_name', 'content'];

    public function message(): BelongsTo
    {
        return $this->belongsTo(PmMessage::class, 'pm_message_id');
    }
}

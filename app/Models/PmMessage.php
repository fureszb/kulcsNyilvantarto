<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PmMessage extends Model
{
    protected $connection = 'tenant';
    protected $table = 'pm_messages';

    protected $fillable = ['content', 'send_to_all', 'sent_by_user_id', 'sent_by_name'];

    protected $casts = [
        'send_to_all' => 'boolean',
    ];

    public function recipients(): HasMany
    {
        return $this->hasMany(PmMessageRecipient::class, 'pm_message_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(PmMessageReply::class, 'pm_message_id')->orderBy('created_at');
    }

    public function scopeVisibleTo($query, int $userId)
    {
        return $query->where('send_to_all', true)
            ->orWhereHas('recipients', fn($q) => $q->where('user_id', $userId));
    }
}

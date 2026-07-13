<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NfcNotification extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['user_id', 'actor_user_id', 'actor_name', 'location_id', 'location_name', 'type', 'occurred_at', 'read_at'];

    protected $casts = [
        'occurred_at' => 'datetime',
        'read_at'     => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'actor_user_id');
    }
}

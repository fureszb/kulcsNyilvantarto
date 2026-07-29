<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuardPosition extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'user_id',
        'lat',
        'lng',
        'accuracy',
        'recorded_at',
        'zone_status',
        'consecutive_outside_count',
    ];

    protected $casts = [
        'lat'         => 'float',
        'lng'         => 'float',
        'accuracy'    => 'float',
        'recorded_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeofenceEvent extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'user_id',
        'location_id',
        'event_type',
        'lat',
        'lng',
        'occurred_at',
    ];

    protected $casts = [
        'lat'         => 'float',
        'lng'         => 'float',
        'occurred_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}

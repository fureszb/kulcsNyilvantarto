<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Item extends Model
{
    protected $fillable = ['location_id', 'name', 'type', 'sort_order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function getTypeIconAttribute(): string
    {
        return $this->type === 'card' ? '💳' : '🔑';
    }

    public function getTypeLabelAttribute(): string
    {
        return $this->type === 'card' ? 'Kártya' : 'Kulcs';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Item extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['location_id', 'group_id', 'name', 'type', 'sort_order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(ItemGroup::class);
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

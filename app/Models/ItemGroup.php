<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemGroup extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['location_id', 'name', 'sort_order'];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'group_id')
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->orderBy('id');
    }

    public function allItems(): HasMany
    {
        return $this->hasMany(Item::class, 'group_id')
                    ->orderBy('sort_order')
                    ->orderBy('id');
    }
}

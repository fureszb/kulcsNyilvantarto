<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Check extends Model
{
    protected $fillable = ['location_id', 'checked_by', 'extra_email', 'notes'];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function checkItems(): HasMany
    {
        return $this->hasMany(CheckItem::class);
    }

    public function getCheckedCountAttribute(): int
    {
        return $this->checkItems->where('is_checked', true)->count();
    }

    public function getTotalCountAttribute(): int
    {
        return $this->checkItems->count();
    }
}

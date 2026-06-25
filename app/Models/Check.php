<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\TenantUser;

class Check extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['location_id', 'user_id', 'checked_by', 'extra_email', 'notes'];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
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

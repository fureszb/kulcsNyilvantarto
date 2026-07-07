<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VezenylesArea extends Model
{
    protected $connection = 'tenant';
    protected $table = 'vezenyles_areas';

    protected $fillable = ['name', 'location_id'];

    public function employees(): HasMany
    {
        return $this->hasMany(VezenylesEmployee::class, 'area_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}

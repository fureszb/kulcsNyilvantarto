<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Training extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['title', 'description', 'is_active', 'sort_order', 'is_location_knowledge'];

    protected $casts = [
        'is_active'             => 'boolean',
        'is_location_knowledge' => 'boolean',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(TrainingStep::class)->orderBy('sort_order')->orderBy('id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingResult extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'training_id',
        'name',
        'email',
        'results',
        'first_try_count',
        'total_steps',
        'completed_at',
    ];

    protected $casts = [
        'results'      => 'array',
        'completed_at' => 'datetime',
    ];

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class);
    }
}

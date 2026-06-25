<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingResult extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'training_id',
        'user_id',
        'mode',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    public function scorePercent(): int
    {
        return $this->total_steps > 0 ? (int) round($this->first_try_count / $this->total_steps * 100) : 0;
    }
}

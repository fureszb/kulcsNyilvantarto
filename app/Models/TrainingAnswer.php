<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingAnswer extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['step_id', 'text', 'is_correct', 'sort_order'];

    protected $casts = ['is_correct' => 'boolean'];

    public function step(): BelongsTo
    {
        return $this->belongsTo(TrainingStep::class, 'step_id');
    }
}

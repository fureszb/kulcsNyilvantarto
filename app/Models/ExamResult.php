<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResult extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['exam_id', 'user_id', 'name', 'email', 'results', 'first_try_count', 'total_steps', 'completed_at'];

    protected $casts = [
        'results'      => 'array',
        'completed_at' => 'datetime',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    public function scorePercent(): int
    {
        if ($this->total_steps === 0) return 0;
        return (int) round($this->first_try_count / $this->total_steps * 100);
    }
}

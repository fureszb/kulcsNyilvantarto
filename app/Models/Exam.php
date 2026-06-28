<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'title', 'description', 'is_active', 'sort_order',
        'max_attempts', 'cooldown_minutes', 'shuffle_questions', 'shuffle_answers', 'time_limit_minutes',
    ];

    protected $casts = [
        'is_active'         => 'boolean',
        'shuffle_questions' => 'boolean',
        'shuffle_answers'   => 'boolean',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(ExamStep::class)->orderBy('sort_order')->orderBy('id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    public function userOverrides(): HasMany
    {
        return $this->hasMany(UserExamOverride::class);
    }
}

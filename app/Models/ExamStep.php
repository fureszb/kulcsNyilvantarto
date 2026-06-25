<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamStep extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['exam_id', 'question', 'question_type', 'sort_order'];

    public const TYPES       = ['radio', 'checkbox', 'text'];
    public const TYPE_LABELS = ['radio' => 'Rádiógomb', 'checkbox' => 'Jelölőnégyzet', 'text' => 'Szöveges'];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ExamAnswer::class)->orderBy('sort_order')->orderBy('id');
    }
}

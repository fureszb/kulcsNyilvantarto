<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class ExamStep extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['exam_id', 'question', 'question_type', 'media_path', 'media_width', 'sort_order'];

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

    public static function isExternalUrl(?string $path): bool
    {
        return $path && (str_starts_with($path, 'http://') || str_starts_with($path, 'https://'));
    }

    public function resolveMediaUrl(?string $path = null): ?string
    {
        $p = $path ?? $this->media_path;
        if (!$p) return null;
        return self::isExternalUrl($p) ? $p : Storage::disk('public')->url($p);
    }

    public function mediaType(?string $path = null): string
    {
        $p = $path ?? $this->media_path;
        if (!$p) return 'none';
        $ext = strtolower(pathinfo(parse_url($p, PHP_URL_PATH) ?? $p, PATHINFO_EXTENSION));
        return in_array($ext, ['mp4', 'webm', 'mov']) ? 'video' : 'image';
    }
}

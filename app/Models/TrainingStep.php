<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class TrainingStep extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['training_id', 'question', 'question_type', 'media_path', 'media_width', 'reveal_media_path', 'reveal_media_width', 'sort_order'];

    public const TYPES = ['radio', 'checkbox', 'text'];
    public const TYPE_LABELS = ['radio' => 'Rádiógomb', 'checkbox' => 'Jelölőnégyzet', 'text' => 'Szöveges'];

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(TrainingAnswer::class, 'step_id')->orderBy('sort_order')->orderBy('id');
    }

    public static function isExternalUrl(?string $path): bool
    {
        return $path && (str_starts_with($path, 'http://') || str_starts_with($path, 'https://'));
    }

    public function resolveMediaUrl(?string $path): ?string
    {
        if (!$path) return null;
        return self::isExternalUrl($path) ? $path : Storage::disk('public')->url($path);
    }

    public function mediaType(?string $path = null): string
    {
        $p = $path ?? $this->media_path;
        if (!$p) return 'none';
        $ext = strtolower(pathinfo(parse_url($p, PHP_URL_PATH) ?? $p, PATHINFO_EXTENSION));
        return in_array($ext, ['mp4', 'webm', 'mov']) ? 'video' : 'image';
    }
}

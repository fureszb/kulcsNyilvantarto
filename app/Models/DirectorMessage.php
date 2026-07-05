<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DirectorMessage extends Model
{
    protected $connection = 'tenant';
    protected $table = 'director_messages';

    protected $fillable = [
        'from_user_id',
        'to_user_id',
        'content',
        'is_anonymous',
        'read_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'read_at'      => 'datetime',
    ];

    public function from(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'from_user_id');
    }

    public function to(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'to_user_id');
    }
}

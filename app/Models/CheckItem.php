<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckItem extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['check_id', 'item_id', 'is_checked'];

    protected $casts = ['is_checked' => 'boolean'];

    public function check(): BelongsTo
    {
        return $this->belongsTo(Check::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}

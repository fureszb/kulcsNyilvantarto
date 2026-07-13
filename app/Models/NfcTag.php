<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NfcTag extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['uid', 'location_id', 'label', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentEvacuationRegistry extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['document_id', 'tenant_name', 'remained_in_building', 'fire_safety_officer_name'];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}

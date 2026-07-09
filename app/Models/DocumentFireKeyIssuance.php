<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentFireKeyIssuance extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'document_id', 'seal_number', 'seal_removed', 'seal_applied', 'issued_at', 'issue_reason', 'closed_at',
    ];

    protected $casts = [
        'seal_removed' => 'boolean',
        'seal_applied' => 'boolean',
        'issued_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}

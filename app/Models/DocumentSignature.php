<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentSignature extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['document_id', 'role', 'signer_name', 'signature_path', 'signed_at', 'embedded_at'];

    protected $casts = [
        'signed_at' => 'datetime',
        'embedded_at' => 'datetime',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}

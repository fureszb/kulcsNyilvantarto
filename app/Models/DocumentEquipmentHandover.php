<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentEquipmentHandover extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'document_id', 'equipment_name', 'issued_at', 'issued_to_name', 'issuer_security_service',
        'returned_at', 'returned_by_name', 'receiver_security_service',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}

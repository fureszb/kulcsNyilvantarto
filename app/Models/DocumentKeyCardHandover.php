<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentKeyCardHandover extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'document_id', 'key_card_number_or_name', 'company_or_workplace', 'issued_at',
        'issued_to_name', 'issued_to_id_card_number', 'security_service', 'returned_at', 'returned_by_name',
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

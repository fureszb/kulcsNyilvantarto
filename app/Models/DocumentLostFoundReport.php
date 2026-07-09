<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentLostFoundReport extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'document_id', 'subject', 'recorded_at', 'location_text', 'representative_user_id',
        'witness_user_id', 'guard_user_id', 'content_description', 'handed_over_at',
        'recipient_name', 'recipient_id_card_number', 'recipient_address',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'handed_over_at' => 'datetime',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function representative(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'representative_user_id');
    }

    public function witness(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'witness_user_id');
    }

    public function guard(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'guard_user_id');
    }
}

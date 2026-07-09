<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentDamageReport extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'document_id', 'recorded_from', 'recorded_to', 'location_text', 'subject',
        'perpetrator_name', 'perpetrator_id_card_number', 'perpetrator_birth_place',
        'perpetrator_birth_date', 'perpetrator_mother_name', 'perpetrator_address',
        'perpetrator_phone', 'perpetrator_email', 'guard_user_id', 'witness_user_id',
        'event_description', 'perpetrator_admitted',
    ];

    protected $casts = [
        'recorded_from' => 'datetime',
        'recorded_to' => 'datetime',
        'perpetrator_birth_date' => 'date',
        'perpetrator_admitted' => 'boolean',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function guard(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'guard_user_id');
    }

    public function witness(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'witness_user_id');
    }
}

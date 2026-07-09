<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentVehicleEntry extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'document_id', 'license_plate', 'company_or_name', 'entry_date', 'entry_time', 'exit_time', 'notes',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'entry_time' => 'datetime',
        'exit_time' => 'datetime',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}

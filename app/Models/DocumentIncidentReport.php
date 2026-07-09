<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DocumentIncidentReport extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['document_id', 'recorded_at', 'location_text', 'event_description'];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /** Jelen lévő vagyonőrök. */
    public function guards(): BelongsToMany
    {
        return $this->belongsToMany(TenantUser::class, 'document_incident_report_guards', 'document_incident_report_id', 'tenant_user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentEvacuationReport extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'document_id', 'prepared_by', 'prepared_by_position', 'location_text', 'event_date',
        'event_description', 'alarm_type', 'alarm_reason', 'evacuation_type', 'fire_alarm_control_notes',
        'deficiencies', 'guard_duty_obligations', 'tenant_obligations', 'had_alarm',
        'fire_what_ignited', 'fire_life_in_danger', 'fire_extinguished_how', 'fire_commander_arrival_time',
        'fire_reentry_protocol', 'fire_cause_responsible',
        'had_early_warning', 'delay_before_siren', 'no_delay_reason', 'no_delay_corrective_actions',
        'delay_reason_not_reacted',
    ];

    protected $casts = [
        'event_date' => 'date',
        'had_alarm' => 'boolean',
        'fire_commander_arrival_time' => 'datetime',
        'had_early_warning' => 'boolean',
        'delay_before_siren' => 'boolean',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}

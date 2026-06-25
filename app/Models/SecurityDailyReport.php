<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SecurityDailyReport extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'report_date', 'service_members', 'previous_shift_members',
        'taken_over_from', 'handover_time', 'cc_recipients',
        'equipment', 'inspectors', 'patrols', 'incidents', 'events',
        'fire_alarms', 'elevators', 'maintenance',
        'prepared_by', 'created_by_user_id',
    ];

    protected $casts = [
        'report_date'            => 'date',
        'service_members'        => 'array',
        'previous_shift_members' => 'array',
        'cc_recipients'          => 'array',
        'equipment'              => 'array',
        'inspectors'             => 'array',
        'patrols'                => 'array',
        'incidents'              => 'array',
        'events'                 => 'array',
        'fire_alarms'            => 'array',
        'elevators'              => 'array',
        'maintenance'            => 'array',
    ];

    public function shares(): HasMany
    {
        return $this->hasMany(SecurityReportShare::class, 'report_id');
    }
}

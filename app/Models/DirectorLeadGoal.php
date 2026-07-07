<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DirectorLeadGoal extends Model
{
    protected $connection = 'tenant';
    protected $table = 'director_lead_goals';

    protected $fillable = [
        'director_id',
        'lead_id',
        'location_id',
        'period_type',
        'year',
        'period',
        'target_completion_pct',
        'target_turnover_pct',
    ];

    protected $casts = [
        'target_completion_pct' => 'float',
        'target_turnover_pct'   => 'float',
    ];

    public function director(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'director_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'lead_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}

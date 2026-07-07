<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VezenylesEmployee extends Model
{
    protected $connection = 'tenant';
    protected $table = 'vezenyles_employees';

    protected $fillable = ['area_id', 'user_id', 'name'];

    public function area(): BelongsTo
    {
        return $this->belongsTo(VezenylesArea::class, 'area_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    public function schedule(): HasMany
    {
        return $this->hasMany(VezenylesSchedule::class, 'employee_id');
    }
}

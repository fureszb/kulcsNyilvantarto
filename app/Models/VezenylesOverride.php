<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VezenylesOverride extends Model
{
    protected $connection = 'tenant';
    protected $table = 'vezenyles_overrides';

    protected $fillable = [
        'area_id', 'employee_id', 'year', 'month', 'day',
        'slot', 'cover_employee_id', 'cover_area_id',
    ];
}

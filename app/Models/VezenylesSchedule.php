<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VezenylesSchedule extends Model
{
    protected $connection = 'tenant';
    protected $table = 'vezenyles_schedule';
    public $timestamps = false;

    protected $fillable = ['employee_id', 'year', 'month', 'day', 'value'];
}

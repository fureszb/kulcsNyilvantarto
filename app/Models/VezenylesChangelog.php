<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VezenylesChangelog extends Model
{
    protected $connection = 'tenant';
    protected $table = 'vezenyles_changelog';
    public $timestamps = false;

    protected $fillable = [
        'year', 'month', 'day', 'absent_employee', 'absent_area',
        'cover_employee', 'cover_area', 'slot', 'action', 'created_at',
    ];
}

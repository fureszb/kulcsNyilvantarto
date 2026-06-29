<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyContact extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['category', 'name', 'phone', 'note', 'sort_order'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityReportShare extends Model
{
    protected $connection = 'tenant';
    protected $table = 'security_report_shares';
    public $timestamps = false;

    protected $fillable = ['report_id', 'user_id'];
}

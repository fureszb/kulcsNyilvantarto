<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiChatMessage extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['session_id', 'role', 'content', 'sources'];

    protected $casts = ['sources' => 'array'];
}

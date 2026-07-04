<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiDocument extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'user_id', 'original_name', 'stored_path', 'size_bytes',
        'status', 'chunk_count', 'error_message',
    ];
}

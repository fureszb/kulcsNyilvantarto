<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PmMessageRecipient extends Model
{
    protected $connection = 'tenant';
    protected $table = 'pm_message_recipients';
    public $timestamps = false;

    protected $fillable = ['pm_message_id', 'user_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }
}

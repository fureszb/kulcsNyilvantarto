<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentAttachment extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['document_id', 'label', 'original_name', 'stored_path', 'size_bytes', 'mime_type'];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}

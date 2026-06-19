<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = ['name', 'slug', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function getDatabasePathAttribute(): string
    {
        return database_path('tenants/' . $this->slug . '.sqlite');
    }

    public function getUrlAttribute(): string
    {
        return url('/' . $this->slug);
    }
}

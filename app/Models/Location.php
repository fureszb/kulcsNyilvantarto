<?php

namespace App\Models;

use App\Models\ItemGroup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['name', 'description', 'icon', 'logo_path', 'responsible_person', 'email', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function items(): HasMany
    {
        return $this->hasMany(Item::class)->where('is_active', true)->orderBy('sort_order')->orderBy('id');
    }

    public function allItems(): HasMany
    {
        return $this->hasMany(Item::class)->orderBy('sort_order')->orderBy('id');
    }

    public function groups(): HasMany
    {
        return $this->hasMany(ItemGroup::class)->orderBy('sort_order')->orderBy('name');
    }

    public function checks(): HasMany
    {
        return $this->hasMany(Check::class);
    }

    /** Az irodaházban dolgozó workerek. */
    public function workers(): BelongsToMany
    {
        return $this->belongsToMany(TenantUser::class, 'location_user', 'location_id', 'user_id')
            ->withTimestamps();
    }

    /** Az irodaházért felelős biztonsági vezetők. */
    public function managers(): BelongsToMany
    {
        return $this->belongsToMany(TenantUser::class, 'location_manager', 'location_id', 'manager_id')
            ->withTimestamps();
    }
}

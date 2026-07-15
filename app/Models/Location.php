<?php

namespace App\Models;

use App\Models\ItemGroup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Location extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['name', 'description', 'icon', 'logo_path', 'responsible_person', 'email', 'is_active', 'polygon'];

    protected $casts = ['is_active' => 'boolean', 'polygon' => 'array'];

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
    public function workers(): HasMany
    {
        return $this->hasMany(TenantUser::class, 'location_id')->where('role', 'user');
    }

    /** Az irodaházért felelős EGY biztonsági vezető. */
    public function securityLead(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'security_lead_id');
    }

    /** Az irodaházat irányító EGY Property Manager. */
    public function propertyManager(): HasOne
    {
        return $this->hasOne(TenantUser::class, 'location_id')->where('role', 'property_manager');
    }

    /** NFC matricák ennél a telephelynél. */
    public function nfcTags(): HasMany
    {
        return $this->hasMany(NfcTag::class);
    }

    /** Akiknek explicit NFC beléptetési joguk van erre a telephelyre. */
    public function nfcGrantedUsers(): BelongsToMany
    {
        return $this->belongsToMany(TenantUser::class, 'nfc_access', 'location_id', 'user_id');
    }

    /** Épp bent tartózkodó userek ezen a telephelyen. */
    public function presentUsers(): HasMany
    {
        return $this->hasMany(TenantUser::class, 'last_entry_location_id')->where('is_present', true);
    }

}

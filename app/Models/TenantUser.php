<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;

class TenantUser extends Authenticatable
{
    use HasPushSubscriptions, Notifiable;

    protected $connection = 'tenant';
    protected $table = 'users';

    protected $fillable = ['name', 'email', 'password', 'role', 'is_active', 'employed_since', 'left_at', 'notes_read_at', 'messages_read_at'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'password'         => 'hashed',
        'is_active'        => 'boolean',
        'employed_since'   => 'date',
        'left_at'          => 'date',
        'notes_read_at'    => 'datetime',
        'messages_read_at' => 'datetime',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPropertyManager(): bool
    {
        return $this->role === 'property_manager';
    }

    /** Biztonsági vezető — PM-szintű jogok, más megnevezéssel. */
    public function isSecurityLead(): bool
    {
        return $this->role === 'security_lead';
    }

    /** Területi igazgató — admin-szintű jogok + saját területi nézetek. */
    public function isAreaDirector(): bool
    {
        return $this->role === 'area_director';
    }

    /** PM-szintű felügyeleti nézetek (dashboard, checks, security, chat). */
    public function canManage(): bool
    {
        return in_array($this->role, ['admin', 'property_manager', 'security_lead', 'area_director']);
    }

    /** Admin-szintű jogok (a területi igazgató is ide tartozik). */
    public function hasAdminPowers(): bool
    {
        return in_array($this->role, ['admin', 'area_director']);
    }

    // ── Szervezeti hierarchia relációk ──────────────────────────────

    /** Worker → irodaházak, ahol dolgozik. */
    public function workLocations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'location_user', 'user_id', 'location_id')
            ->withTimestamps();
    }

    /** Biztonsági vezető → irodaházak, amikért felel. */
    public function managedLocations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'location_manager', 'manager_id', 'location_id')
            ->withTimestamps();
    }

    /** Területi igazgató → felügyelt biztonsági vezetők. */
    public function supervisedLeads(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'director_lead', 'director_id', 'lead_id')
            ->withTimestamps();
    }

    /** Biztonsági vezető → őt felügyelő területi igazgatók. */
    public function directors(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'director_lead', 'lead_id', 'director_id')
            ->withTimestamps();
    }
}

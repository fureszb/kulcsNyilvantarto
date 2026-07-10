<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use NotificationChannels\WebPush\HasPushSubscriptions;

class TenantUser extends Authenticatable
{
    use HasApiTokens, HasPushSubscriptions, Notifiable;

    protected $connection = 'tenant';
    protected $table = 'users';

    protected $fillable = ['name', 'email', 'password', 'role', 'is_active', 'employed_since', 'left_at', 'notes_read_at', 'messages_read_at', 'location_id', 'director_id'];

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

    /** Ki hozhat létre biztonsági dokumentumot/jegyzőkönyvet — PM és területi
     *  igazgató csak megtekintheti, nem rögzíthet eseményt. */
    public function canCreateDocuments(): bool
    {
        return in_array($this->role, ['user', 'security_lead', 'admin']);
    }

    // ── Szervezeti hierarchia relációk (ER-diagram szerint N:1/1:1) ──

    /** Dolgozó/PM → az EGY irodaház, ahol dolgozik / amit vezet. */
    public function workLocations(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    /** Biztonsági vezető → irodaházak, amikért felel (1:N — egy vezető
     *  több irodaházért is felelhet, de egy irodaháznak csak egy felelőse van). */
    public function managedLocations(): HasMany
    {
        return $this->hasMany(Location::class, 'security_lead_id');
    }

    /** Területi igazgató → felügyelt biztonsági vezetők (1:N). */
    public function supervisedLeads(): HasMany
    {
        return $this->hasMany(self::class, 'director_id');
    }

    /** Biztonsági vezető → az EGY felügyelő területi igazgató. */
    public function director(): BelongsTo
    {
        return $this->belongsTo(self::class, 'director_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;

class TenantUser extends Authenticatable
{
    use HasPushSubscriptions, Notifiable;

    protected $connection = 'tenant';
    protected $table = 'users';

    protected $fillable = ['name', 'email', 'password', 'role', 'is_active', 'employed_since', 'notes_read_at', 'messages_read_at'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'password'         => 'hashed',
        'is_active'        => 'boolean',
        'employed_since'   => 'date',
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

    public function canManage(): bool
    {
        return in_array($this->role, ['admin', 'property_manager']);
    }
}

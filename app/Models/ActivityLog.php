<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'event_type',
        'user_id',
        'user_name',
        'description',
        'metadata',
        'occurred_at',
    ];

    protected $casts = [
        'metadata'    => 'array',
        'occurred_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    public static function record(string $eventType, ?TenantUser $user, string $description, array $metadata = []): void
    {
        static::create([
            'event_type'  => $eventType,
            'user_id'     => $user?->id,
            'user_name'   => $user?->name ?? 'Ismeretlen',
            'description' => $description,
            'metadata'    => $metadata ?: null,
            'occurred_at' => now(),
        ]);
    }

    public function eventLabel(): string
    {
        return match ($this->event_type) {
            'check.completed'    => 'Ellenőrzés',
            'training.completed' => 'Oktatás',
            'exam.completed'     => 'Vizsga',
            'user.login'         => 'Bejelentkezés',
            'user.logout'        => 'Kijelentkezés',
            'security.created'   => 'Napi jelentés',
            'security.updated'   => 'Jelentés módosítva',
            'shift_note.created' => 'Váltóüzenet',
            'shift_note.updated' => 'Váltóüzenet módosítva',
            'shift_note.deleted' => 'Váltóüzenet törölve',
            'pm_message.sent'    => 'PM üzenet',
            'pm_message.updated' => 'PM üzenet módosítva',
            'pm_message.deleted' => 'PM üzenet törölve',
            'pm_message_reply.updated' => 'Válasz módosítva',
            'pm_message_reply.deleted' => 'Válasz törölve',
            'document.created'   => 'Dokumentum',
            'nfc.checkpoint'      => 'NFC-ellenőrzés',
            'nfc.entry', 'geofence.zone_enter' => 'Beléptél',
            'nfc.exit', 'geofence.zone_exit'   => 'Kiléptél',
            'nfc.denied'          => 'Elutasított ellenőrzés',
            default              => $this->event_type,
        };
    }

    public function eventColor(): string
    {
        return match ($this->event_type) {
            'check.completed'    => 'blue',
            'training.completed' => 'indigo',
            'exam.completed'     => 'amber',
            'user.login'         => 'slate',
            'user.logout'        => 'slate',
            'security.created'   => 'rose',
            'security.updated'   => 'rose',
            'shift_note.created' => 'teal',
            'shift_note.updated' => 'teal',
            'shift_note.deleted' => 'teal',
            'pm_message.sent'    => 'amber',
            'pm_message.updated' => 'amber',
            'pm_message.deleted' => 'amber',
            'pm_message_reply.updated' => 'amber',
            'pm_message_reply.deleted' => 'amber',
            'document.created'   => 'cyan',
            'nfc.checkpoint'      => 'emerald',
            'nfc.entry', 'geofence.zone_enter' => 'emerald',
            'nfc.exit', 'geofence.zone_exit'   => 'slate',
            'nfc.denied'          => 'rose',
            default              => 'slate',
        };
    }
}

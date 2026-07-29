<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/** Minden geofence-ping után tüzel (nem csak zóna-átlépésnél), hogy a "Ki van bent"
 *  térkép valóban élőben kövesse az őr mozgását — a GeofenceZoneEvent ezzel szemben
 *  csak megerősített zóna-váltásnál (riasztás + push), az túl ritka lenne élő térképhez. */
class GuardPositionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $tenantSlug,
        public readonly int $userId,
        public readonly string $userName,
        public readonly int $locationId,
        public readonly float $lat,
        public readonly float $lng,
        public readonly string $zoneStatus,
        public readonly string $recordedAt,
    ) {}

    public function broadcastWith(): array
    {
        return [
            'userId'     => $this->userId,
            'userName'   => $this->userName,
            'locationId' => $this->locationId,
            'lat'        => $this->lat,
            'lng'        => $this->lng,
            'zoneStatus' => $this->zoneStatus,
            'recordedAt' => $this->recordedAt,
        ];
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("tenant.{$this->tenantSlug}.presence")];
    }

    public function broadcastAs(): string
    {
        return 'position-update';
    }
}

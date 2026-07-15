<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GeofenceZoneEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @param array<int> $bossIds */
    public function __construct(
        public readonly string $tenantSlug,
        public readonly array $bossIds,
        public readonly int $userId,
        public readonly string $userName,
        public readonly int $locationId,
        public readonly string $locationName,
        public readonly string $type, // 'zone_exit' | 'zone_enter'
        public readonly float $lat,
        public readonly float $lng,
        public readonly string $occurredAt,
    ) {}

    public function broadcastWith(): array
    {
        return [
            'userId'       => $this->userId,
            'userName'     => $this->userName,
            'locationId'   => $this->locationId,
            'locationName' => $this->locationName,
            'type'         => $this->type,
            'lat'          => $this->lat,
            'lng'          => $this->lng,
            'occurredAt'   => $this->occurredAt,
        ];
    }

    public function broadcastOn(): array
    {
        $channels = array_map(
            fn ($bossId) => new PrivateChannel("tenant.{$this->tenantSlug}.{$bossId}"),
            $this->bossIds,
        );
        $channels[] = new PrivateChannel("tenant.{$this->tenantSlug}.presence");

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'geofence';
    }
}

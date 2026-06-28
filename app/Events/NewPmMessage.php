<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewPmMessage implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array  $message,
        public readonly string $tenantSlug,
        public readonly array  $recipientIds,
    ) {}

    public function broadcastOn(): array
    {
        return array_map(
            fn($userId) => new PrivateChannel("tenant.{$this->tenantSlug}.{$userId}"),
            $this->recipientIds,
        );
    }

    public function broadcastAs(): string
    {
        return 'new-pm-message';
    }

    public function broadcastWith(): array
    {
        return $this->message;
    }
}

<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewShiftNote implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $tenantSlug,
        public readonly string $authorName = '',
        public readonly int $senderUserId = 0,
    ) {}

    public function broadcastWith(): array
    {
        return [
            'authorName'   => $this->authorName,
            'senderUserId' => $this->senderUserId,
        ];
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("tenant.{$this->tenantSlug}")];
    }

    public function broadcastAs(): string
    {
        return 'new-shift-note';
    }
}

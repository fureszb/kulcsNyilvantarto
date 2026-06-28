<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewPmReply implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array  $reply,
        public readonly string $tenantSlug,
        public readonly int    $pmUserId,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("tenant.{$this->tenantSlug}.{$this->pmUserId}")];
    }

    public function broadcastAs(): string { return 'new-pm-reply'; }
    public function broadcastWith(): array { return $this->reply; }
}

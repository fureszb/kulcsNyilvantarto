<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class ChatPushNotification extends Notification
{
    public function __construct(
        public string $title,
        public string $body,
        public string $url,
        public string $tag = 'chat',
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, object $notification): WebPushMessage
    {
        return (new WebPushMessage)
            ->title($this->title)
            ->body(mb_substr($this->body, 0, 180))
            ->icon('/icons/icon-192.png')
            ->badge('/icons/badge-72.png')
            ->tag($this->tag)
            ->renotify()
            ->data(['url' => $this->url])
            ->options(['TTL' => 3600]);
    }
}

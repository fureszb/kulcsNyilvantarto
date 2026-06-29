<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewPmMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $senderName,
        public readonly string $messageContent,
        public readonly string $recipientName,
        public readonly string $tenantName,
        public readonly string $loginUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Új üzenet érkezett – ' . $this->tenantName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new_pm_message',
        );
    }
}

<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewShiftNoteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $authorName,
        public readonly string $noteContent,
        public readonly string $tenantName,
        public readonly string $loginUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Új váltóüzenet érkezett – ' . $this->tenantName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new_shift_note',
        );
    }
}

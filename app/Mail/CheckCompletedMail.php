<?php

namespace App\Mail;

use App\Models\Check;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CheckCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Check $check) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kulcs/Kártya ellenőrzés – ' . $this->check->location->name . ' – ' . $this->check->created_at->format('Y.m.d H:i'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.check_completed',
            with: ['check' => $this->check],
        );
    }
}

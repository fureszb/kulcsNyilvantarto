<?php

namespace App\Mail;

use App\Models\Training;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrainingResultMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Training $training,
        public array    $results,
        public int      $firstTryCount,
        public int      $totalSteps,
        public string   $tenantName,
        public string   $completedAt,
        public string   $participantName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Oktatás elvégezve: ' . $this->training->title . ' – ' . $this->completedAt,
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.training_result');
    }
}

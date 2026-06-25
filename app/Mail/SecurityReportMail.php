<?php

namespace App\Mail;

use App\Models\SecurityDailyReport;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SecurityReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public SecurityDailyReport $report,
        public string $tenantName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Napi Jelentés – ' . $this->report->report_date->format('Y. m. d.') . ' – ' . $this->tenantName,
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.security_report');
    }
}

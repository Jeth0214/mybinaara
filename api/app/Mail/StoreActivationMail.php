<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Store;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StoreActivationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Store $store,
        public readonly User $owner,
        public readonly string $temporaryPassword,
        public readonly string $activationUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Activate your MyBinaara store: {$this->store->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.store-activation',
        );
    }
}

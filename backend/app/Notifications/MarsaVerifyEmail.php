<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailNotification;
use Illuminate\Notifications\Messages\MailMessage;

class MarsaVerifyEmail extends VerifyEmailNotification
{
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Confirm your email — MARSA Founders')
            ->view('emails.marsa.verify-email', [
                'userName' => $notifiable->name,
                'actionUrl' => $verificationUrl,
            ]);
    }
}

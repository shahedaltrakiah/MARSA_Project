<?php

namespace App\Mail;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectInvitationMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        public ProjectInvitation $invitation,
        public Project $project,
        public User $inviter,
        public string $registerUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->inviter->name.' invited you to '.$this->project->name.' — MARSA Founders',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.marsa.project-invitation',
            with: [
                'projectName' => $this->project->name,
                'inviterName' => $this->inviter->name,
                'inviteeEmail' => $this->invitation->email,
                'role' => $this->invitation->role,
                'registerUrl' => $this->registerUrl,
                'expiresAt' => $this->invitation->expires_at,
            ],
        );
    }
}

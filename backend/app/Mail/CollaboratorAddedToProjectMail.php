<?php

namespace App\Mail;

use App\Models\Project;
use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CollaboratorAddedToProjectMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        public Project $project,
        public User $inviter,
        public User $invitee,
        public string $role
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You’ve been added to '.$this->project->name.' — MARSA Founders',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.marsa.collaborator-added',
            with: [
                'projectName' => $this->project->name,
                'inviterName' => $this->inviter->name,
                'inviteeName' => $this->invitee->name,
                'role' => $this->role,
                'workspaceUrl' => rtrim(config('app.frontend_url'), '/').'/app/projects/'.$this->project->id.'/progress',
            ],
        );
    }
}

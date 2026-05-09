<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'last_modified_by',
        'name',
        'logo',
        'description',
        'idea_profile',
        'idea_profile_completed_at',
    ];

    protected function casts(): array
    {
        return [
            'idea_profile' => 'array',
            'idea_profile_completed_at' => 'datetime',
        ];
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function lastModifiedBy()
    {
        return $this->belongsTo(User::class, 'last_modified_by');
    }

    public function collaborators()
    {
        return $this->belongsToMany(User::class, 'project_collaborators')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    public function hasCollaborator(User $user): bool
    {
        return $this->collaborators()->where('user_id', $user->id)->exists();
    }

    public function getCollaboratorRole(User $user): ?string
    {
        $collaborator = $this->collaborators()->where('user_id', $user->id)->first();

        return $collaborator?->pivot->role;
    }

    public function sections()
    {
        return $this->hasMany(ProjectSection::class);
    }

    /**
     * @return HasMany<ProjectInvitation, Project>
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(ProjectInvitation::class);
    }
}

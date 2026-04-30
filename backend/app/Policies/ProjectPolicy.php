<?php
namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        return $project->isOwnedBy($user) || $project->hasCollaborator($user);
    }

    public function update(User $user, Project $project): bool
    {
        if ($project->isOwnedBy($user)) return true;
        return in_array($project->getCollaboratorRole($user), ['editor']);
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->isOwnedBy($user);
    }
}

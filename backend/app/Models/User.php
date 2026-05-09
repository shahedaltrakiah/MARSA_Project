<?php

namespace App\Models;

use App\Notifications\MarsaVerifyEmail;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, MustVerifyEmailTrait, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'admin_site_permissions'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'admin_site_permissions' => 'array',
        ];
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function startupProfile()
    {
        return $this->hasOne(StartupProfile::class);
    }

    public function ownedProjects()
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function collaboratingProjects()
    {
        return $this->belongsToMany(Project::class, 'project_collaborators')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new MarsaVerifyEmail);
    }
}

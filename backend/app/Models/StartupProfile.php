<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StartupProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'idea', 'problem', 'solution', 'customer',
        'stage', 'team', 'traction', 'challenges', 'goals',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function files()
    {
        return $this->hasMany(ProfileFile::class, 'profile_id');
    }
}

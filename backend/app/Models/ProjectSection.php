<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectSection extends Model
{
    protected $fillable = ['project_id', 'section', 'content', 'updated_by'];

    protected $casts = [
        'content' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}

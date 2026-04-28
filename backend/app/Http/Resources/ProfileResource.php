<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'idea' => $this->idea,
            'problem' => $this->problem,
            'solution' => $this->solution,
            'customer' => $this->customer,
            'stage' => $this->stage,
            'team' => $this->team,
            'traction' => $this->traction,
            'challenges' => $this->challenges,
            'goals' => $this->goals,
            'files' => ProfileFileResource::collection($this->whenLoaded('files')),
            'updated_at' => $this->updated_at,
        ];
    }
}

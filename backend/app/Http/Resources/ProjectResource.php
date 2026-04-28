<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'logo' => $this->logo,
            'description' => $this->description,
            'owner' => new UserResource($this->whenLoaded('owner')),
            'last_modified_by' => new UserResource($this->whenLoaded('lastModifiedBy')),
            'collaborators' => ProjectCollaboratorResource::collection($this->whenLoaded('collaborators')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

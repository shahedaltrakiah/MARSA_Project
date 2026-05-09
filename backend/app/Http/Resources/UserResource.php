<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $role = $this->role ?? 'user';

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'role' => $role,
            'created_at' => $this->created_at,
            'admin_site_permissions' => $role === 'admin'
                ? ($this->admin_site_permissions ?? [])
                : null,
        ];
    }
}

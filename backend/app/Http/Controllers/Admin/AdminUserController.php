<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $scope = $request->query('scope', 'all');

        $query = User::withCount('ownedProjects as project_count')->latest();

        if ($scope === 'users') {
            $query->where('role', 'user');
        } elseif ($scope === 'admins') {
            $query->whereIn('role', ['admin', 'super_admin']);
        }

        $users = $query->paginate(20);

        return response()->json([
            'data' => $users->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role ?? 'user',
                'project_count' => $u->project_count,
                'created_at' => $u->created_at,
            ]),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->loadMissing(['startupProfile', 'ownedProjects']);
        $role = $user->role ?? 'user';

        return response()->json([
            'data' => [
                'id'                     => $user->id,
                'name'                   => $user->name,
                'email'                  => $user->email,
                'role'                   => $role,
                'created_at'             => $user->created_at,
                'admin_site_permissions' => $role === 'admin'
                    ? ($user->admin_site_permissions ?? [])
                    : null,
                'startup_profile' => $user->startupProfile,
                'projects' => $user->ownedProjects->map(fn ($p) => [
                    'id'         => $p->id,
                    'name'       => $p->name,
                    'created_at' => $p->created_at,
                ]),
            ],
        ]);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:user,admin,super_admin'],
            'admin_site_permissions' => ['sometimes', 'nullable', 'array'],
            'admin_site_permissions.*' => ['string', 'in:branding,hero,features,pricing'],
        ]);

        $role = $validated['role'];
        $perms = null;
        if ($role === 'admin') {
            $perms = array_values(array_unique($validated['admin_site_permissions'] ?? []));
        }

        $user->update([
            'role' => $role,
            'admin_site_permissions' => $perms,
        ]);

        return response()->json(['data' => new UserResource($user->fresh())]);
    }
}

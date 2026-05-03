<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::withCount('ownedProjects as project_count')
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $users->map(fn($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'role'          => $u->role ?? 'user',
                'project_count' => $u->project_count,
                'created_at'    => $u->created_at,
            ]),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->loadMissing(['startupProfile', 'ownedProjects']);

        return response()->json([
            'data' => [
                'id'              => $user->id,
                'name'            => $user->name,
                'email'           => $user->email,
                'role'            => $user->role ?? 'user',
                'created_at'      => $user->created_at,
                'startup_profile' => $user->startupProfile,
                'projects'        => $user->ownedProjects->map(fn($p) => [
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
        ]);

        $user->update(['role' => $validated['role']]);

        return response()->json(['data' => new UserResource($user->fresh())]);
    }
}

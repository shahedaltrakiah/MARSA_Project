<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StartupProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    private const PROFILE_TEXT_FIELDS = [
        'idea', 'problem', 'solution', 'customer',
        'team', 'traction', 'challenges', 'goals',
    ];

    public function index(): JsonResponse
    {
        $workspaceMembers = User::where('role', 'user')->count();
        $staff = User::whereIn('role', ['admin', 'super_admin'])->count();

        $profilesStarted = User::where('role', 'user')
            ->whereHas('startupProfile', fn ($q) => $this->profileHasAnyContentQuery($q))
            ->count();

        $recent = User::query()
            ->where('role', 'user')
            ->with('startupProfile')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($u) => $this->entrepreneurRow($u));

        return response()->json([
            'data' => [
                'stats' => [
                    'workspace_members' => $workspaceMembers,
                    'staff' => $staff,
                    'profiles_with_content' => $profilesStarted,
                ],
                'recent_entrepreneurs' => $recent,
            ],
        ]);
    }

    public function entrepreneurs(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', 'user')
            ->with('startupProfile')
            ->latest();

        $paginator = $query->paginate(25);

        return response()->json([
            'data' => $paginator->map(fn ($u) => $this->entrepreneurRow($u)),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    private function profileHasAnyContentQuery($query): void
    {
        $query->where(function ($q) {
            foreach (self::PROFILE_TEXT_FIELDS as $field) {
                $q->orWhere(function ($qq) use ($field) {
                    $qq->whereNotNull($field)->where($field, '!=', '');
                });
            }
            $q->orWhereNotNull('stage');
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function entrepreneurRow(User $user): array
    {
        /** @var StartupProfile|null $p */
        $p = $user->startupProfile;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'registered_at' => $user->created_at,
            'profile_completion_pct' => $this->profileCompletionPct($p),
            'startup_profile' => $p ? [
                'idea' => $p->idea,
                'problem' => $p->problem,
                'solution' => $p->solution,
                'customer' => $p->customer,
                'stage' => $p->stage,
                'team' => $p->team,
                'traction' => $p->traction,
                'challenges' => $p->challenges,
                'goals' => $p->goals,
                'updated_at' => $p->updated_at,
            ] : null,
        ];
    }

    private function profileCompletionPct(?StartupProfile $p): int
    {
        if (! $p) {
            return 0;
        }

        $filled = 0;
        $total = count(self::PROFILE_TEXT_FIELDS) + 1;

        foreach (self::PROFILE_TEXT_FIELDS as $field) {
            $v = $p->{$field};
            if (is_string($v) && trim($v) !== '') {
                $filled++;
            }
        }
        if ($p->stage !== null && $p->stage !== '') {
            $filled++;
        }

        return (int) round(($filled / $total) * 100);
    }
}

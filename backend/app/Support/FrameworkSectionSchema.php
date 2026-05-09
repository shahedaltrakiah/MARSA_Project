<?php

namespace App\Support;

/**
 * Single source of truth for flat workspace framework sections (pillars/tabs).
 * Matches frontend workspace structure: each pillar has notes + points[].
 */
final class FrameworkSectionSchema
{
    /**
     * @var array<string, list<string>>
     */
    public const FLAT_SECTIONS = [
        'offering' => ['value_proposition', 'swot', 'solution', 'future_growth'],
        'reach' => ['business_model', 'branding', 'marketing', 'sales'],
        'customer' => ['segments', 'profile', 'market', 'journey'],
        'money' => ['investment', 'revenue', 'cac_clv', 'cashflow'],
        'assets' => ['team', 'partners', 'setup', 'technology'],
        'action' => ['tasks', 'research', 'validation', 'kpis'],
        'targets' => ['cash', 'position', 'awareness', 'value'],
    ];

    /** Human labels for AI prompts */
    public const SECTION_GUIDANCE = [
        'offering' => 'Value proposition, SWOT, solution, future growth',
        'reach' => 'Business model, branding, marketing, sales',
        'customer' => 'Segments, profile, market, journey',
        'money' => 'Investment, revenue, CAC & CLV, cashflow',
        'assets' => 'Team, partners, setup, technology',
        'action' => 'Tasks, research, validation, KPIs',
        'targets' => 'Cash, position, awareness, value goals',
    ];
}

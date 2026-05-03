<?php
namespace App\Http\Controllers;

use App\Models\ContentBlock;
use App\Models\SiteSettings;
use Illuminate\Http\JsonResponse;

class SiteController extends Controller
{
    private const DEFAULTS = [
        'hero' => [
            'en' => [
                'badge'          => 'MARSA — your startup workspace',
                'headline_start' => 'Go from idea to execution with a',
                'headline_end'   => ' workspace.',
                'subtitle'       => 'Build your offering, map your business model, track runway, and ship weekly — with guided prompts and a single source of truth for your startup.',
                'cta_primary'    => 'Start free',
                'cta_secondary'  => 'Talk to us',
            ],
            'ar' => [
                'badge'          => 'مارسا — مساحة عملك لريادة الأعمال',
                'headline_start' => 'من الفكرة إلى التنفيذ مع ',
                'headline_end'   => '٫',
                'subtitle'       => 'ابنِ عرضك، وضِح نموذج عملك، تتبع المدى المالي، ونفّذ أسبوعيًا — مع إرشادات موجهة ومصدر واحد للحقيقة لمشروعك الناشئ.',
                'cta_primary'    => 'ابدأ مجانًا',
                'cta_secondary'  => 'تحدث معنا',
            ],
        ],
        'features' => [
            'en' => [
                ['title' => 'Idea validation',        'description' => 'Turn your idea into testable assumptions. Capture hypotheses, experiments, learnings, and next decisions.', 'bullets' => ['Assumption tracking', 'Experiment planning', 'Decision notes']],
                ['title' => 'Business model builder', 'description' => 'Structure your offering, pricing, channels, costs, and customer segments. Keep everything connected and clear.', 'bullets' => ['Value proposition', 'Channels + pricing', 'Cost structure']],
                ['title' => 'Financial wizard',       'description' => 'Plan runway and scenarios without spreadsheet chaos. Make financial decisions grounded and repeatable.', 'bullets' => ['Runway planning', 'Assumptions & scenarios', 'Targets & milestones']],
                ['title' => 'Task management',        'description' => 'Transform strategy into weekly actions. Keep execution aligned with the model and goals you set.', 'bullets' => ['Weekly planning', 'Outcome focus', 'Simple prioritization']],
                ['title' => 'AI recommendations',     'description' => 'Get context-aware suggestions, next steps, and prompts that reduce decision fatigue as you build.', 'bullets' => ['Next-step prompts', 'Clarity questions', 'Workflow guidance']],
                ['title' => 'Trust & security',       'description' => 'A clean, modern foundation designed for SaaS reliability.', 'bullets' => ['Role-ready layout', 'Consistent UI system', 'Future-proof structure']],
            ],
            'ar' => [
                ['title' => 'التحقق من الفكرة',         'description' => 'حوّل فكرتك إلى افتراضات قابلة للاختبار.', 'bullets' => ['تتبع الافتراضات', 'تخطيط التجارب', 'ملاحظات القرار']],
                ['title' => 'بناء نموذج العمل',          'description' => 'هيّئ عرضك والتسعير والقنوات والتكاليف والشرائح.', 'bullets' => ['عرض القيمة', 'القنوات والتسعير', 'هيكل التكلفة']],
                ['title' => 'المعالج المالي',             'description' => 'خطط للمدى والسيناريوهات دون فوضى جداول.', 'bullets' => ['تخطيط المدى', 'الافتراضات والسيناريوهات', 'الأهداف والمعالم']],
                ['title' => 'إدارة المهام',               'description' => 'حوّل الاستراتيجية إلى إجراءات أسبوعية.', 'bullets' => ['التخطيط الأسبوعي', 'التركيع على النتائج', 'أولويات بسيطة']],
                ['title' => 'توصيات الذكاء الاصطناعي',   'description' => 'احصل على اقتراحات وخطوات تالية وأسئلة.', 'bullets' => ['اقتراحات للخطوة التالية', 'أسئلة توضيحية', 'إرشاد سير العمل']],
                ['title' => 'الثقة والأمان',               'description' => 'أساس حديث لموثوقية SaaS.', 'bullets' => ['تخطيط جاهز للأدوار', 'واجهة متسقة', 'هيكل قابل للتوسع']],
            ],
        ],
        'pricing_free' => [
            'en' => ['name' => 'Free',        'price' => '$0',  'description' => 'Start with structure and clarity.',                    'features' => ['1 project', 'Core framework', 'Notes panel', 'Theme switching']],
            'ar' => ['name' => 'مجاني',       'price' => '$0',  'description' => 'ابدأ بهيكلية ووضوح.',                                  'features' => ['مشروع واحد', 'إطار أساسي', 'لوحة ملاحظات', 'تبديل السمة']],
        ],
        'pricing_pro' => [
            'en' => ['name' => 'Pro',         'price' => '$19', 'description' => 'For founders building weekly momentum.',               'features' => ['Unlimited projects', 'Financial wizard', 'AI recommendations', 'Priority updates']],
            'ar' => ['name' => 'احترافي',     'price' => '$19', 'description' => 'للمؤسسين الذين يبنون زخمًا أسبوعيًا.',               'features' => ['مشاريع غير محدودة', 'معالج مالي', 'توصيات ذكاء اصطناعي', 'تحديثات أولوية']],
        ],
        'pricing_team' => [
            'en' => ['name' => 'Team',        'price' => '$49', 'description' => 'For early teams collaborating end-to-end.',            'features' => ['Collaboration', 'Roles & permissions', 'Shared dashboards', 'Admin controls']],
            'ar' => ['name' => 'فريق',        'price' => '$49', 'description' => 'للفرق المبكرة التي تتعاون من البداية للنهاية.',       'features' => ['تعاون', 'أدوار وصلاحيات', 'لوحات مشتركة', 'تحكم إداري']],
        ],
    ];

    public function index(): JsonResponse
    {
        $settings = SiteSettings::first();
        $saved    = ContentBlock::all()->keyBy('key');

        $blocks = [];
        foreach (array_keys(self::DEFAULTS) as $key) {
            $blocks[$key] = $saved->has($key) ? $saved[$key]->content : self::DEFAULTS[$key];
        }

        return response()->json([
            'settings' => [
                'logo_url'        => $settings?->logo_url,
                'primary_color'   => $settings?->primary_color  ?? '#002d62',
                'secondary_color' => $settings?->secondary_color ?? '#00c4cc',
            ],
            'blocks' => $blocks,
        ]);
    }
}

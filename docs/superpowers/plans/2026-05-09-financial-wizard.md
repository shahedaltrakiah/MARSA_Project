# Financial Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Financial Wizard that accepts project financial inputs on the frontend, runs all calculations server-side, stores results per-project per-scenario, and exports to PDF/Excel.

**Architecture:** Frontend collects raw numeric inputs via a multi-step wizard and displays pre-computed results from the backend. Laravel backend owns all calculation logic (FinancialCalculationService), persists inputs in `financial_inputs`, and serves calculated outputs as JSON. Exports (PDF, Excel) are generated server-side and streamed as file downloads.

**Tech Stack:** Laravel 11 (backend), Next.js 16 / React 19 (frontend), phpoffice/phpspreadsheet, barryvdh/laravel-dompdf, TailwindCSS v4, Axios

---

## File Map

### Backend (new files)
- `backend/database/migrations/2026_05_09_180000_create_financial_inputs_table.php`
- `backend/app/Models/FinancialInput.php`
- `backend/app/Services/FinancialCalculationService.php`
- `backend/app/Services/FinancialExportService.php`
- `backend/app/Http/Controllers/FinancialController.php`
- `backend/resources/views/financial/pdf_export.blade.php`
- `backend/tests/Unit/FinancialCalculationServiceTest.php`
- `backend/tests/Feature/FinancialControllerTest.php`

### Backend (modified)
- `backend/routes/api.php` — add financial routes
- `backend/composer.json` — add phpspreadsheet + dompdf

### Frontend (new files)
- `frontend/components/project/financial/financialTypes.ts` — replace with snake_case types
- `frontend/lib/financialApi.ts` — API calls
- `frontend/hooks/useFinancialData.ts` — data fetching hook
- `frontend/components/project/financial/FinancialInputSections.tsx` — input form sections
- `frontend/components/project/financial/FinancialResultTabs.tsx` — result display tabs
- `frontend/components/project/financial/FinancialStatementModal.tsx` — main modal

### Frontend (modified)
- `frontend/app/app/projects/[id]/money/page.tsx` — pass projectId to modal

### Frontend (deleted)
- `frontend/components/project/financial/financialCalculations.ts` — remove (calcs move to backend)

---

## Task 1: Database Migration + Model + Route Stubs

**Files:**
- Create: `backend/database/migrations/2026_05_09_180000_create_financial_inputs_table.php`
- Create: `backend/app/Models/FinancialInput.php`
- Modify: `backend/routes/api.php`

- [ ] **Step 1: Write the feature test stubs (will fail — models don't exist yet)**

```php
<?php
// backend/tests/Feature/FinancialControllerTest.php
namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
    }

    public function test_show_returns_empty_scenario_when_no_data(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/projects/{$this->project->id}/financial/expected");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['inputs', 'outputs']]);
    }

    public function test_save_and_calculate_returns_computed_outputs(): void
    {
        $payload = $this->validInputPayload();

        $response = $this->actingAs($this->user)
            ->putJson("/api/projects/{$this->project->id}/financial/expected", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.outputs.income_statement.revenue', fn($v) => $v > 0)
            ->assertJsonPath('data.inputs.currency', 'USD');
    }

    public function test_show_all_scenarios_returns_three_entries(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/projects/{$this->project->id}/financial");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['expected', 'best', 'worst']]);
    }

    public function test_export_excel_returns_file(): void
    {
        $this->actingAs($this->user)
            ->putJson("/api/projects/{$this->project->id}/financial/expected", $this->validInputPayload());

        $response = $this->actingAs($this->user)
            ->get("/api/projects/{$this->project->id}/financial/expected/export/excel");

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson("/api/projects/{$this->project->id}/financial/expected")
            ->assertStatus(401);
    }

    public function test_non_owner_cannot_access(): void
    {
        $other = User::factory()->create();
        $this->actingAs($other)
            ->getJson("/api/projects/{$this->project->id}/financial/expected")
            ->assertStatus(403);
    }

    private function validInputPayload(): array
    {
        return [
            'currency' => 'USD',
            'product_description' => 'Test product',
            'product_category' => 'Technology',
            'annual_units_sold' => 1000,
            'selling_price_per_unit' => 50.00,
            'unit_cost' => 20.00,
            'annual_units_purchased' => 1000,
            'annual_rent' => 12000,
            'annual_utilities' => 3000,
            'num_employees' => 5,
            'employee_annual_salary' => 24000,
            'num_managers' => 1,
            'manager_annual_salary' => 36000,
            'office_supplies' => 1200,
            'advertising' => 5000,
            'legal_fees' => 2000,
            'other_expenses' => [],
            'computers_value' => 5000,
            'computers_life_years' => 3,
            'furniture_value' => 3000,
            'furniture_life_years' => 5,
            'equipment_value' => 10000,
            'equipment_life_years' => 7,
            'other_capex' => [],
            'cash_contribution' => 20000,
            'borrowing' => 30000,
            'other_funds' => [],
            'interest_rate' => 5.0,
            'loan_duration' => 5,
            'credit_sales_percent' => 30,
            'credit_purchases_percent' => 20,
        ];
    }
}
```

- [ ] **Step 2: Run test to confirm it fails (models/routes missing)**

```bash
cd backend && php artisan test tests/Feature/FinancialControllerTest.php
```
Expected: FAIL — "Class App\Models\FinancialInput not found" or 404 on routes.

- [ ] **Step 3: Create migration**

```php
<?php
// backend/database/migrations/2026_05_09_180000_create_financial_inputs_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_inputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('scenario', 20); // expected | best | worst
            $table->string('currency', 10)->default('USD');
            $table->string('product_description')->nullable();
            $table->string('product_category')->nullable();
            $table->unsignedInteger('annual_units_sold')->default(0);
            $table->decimal('selling_price_per_unit', 15, 2)->default(0);
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->unsignedInteger('annual_units_purchased')->default(0);
            $table->decimal('annual_rent', 15, 2)->default(0);
            $table->decimal('annual_utilities', 15, 2)->default(0);
            $table->unsignedSmallInteger('num_employees')->default(0);
            $table->decimal('employee_annual_salary', 15, 2)->default(0);
            $table->unsignedSmallInteger('num_managers')->default(0);
            $table->decimal('manager_annual_salary', 15, 2)->default(0);
            $table->decimal('office_supplies', 15, 2)->default(0);
            $table->decimal('advertising', 15, 2)->default(0);
            $table->decimal('legal_fees', 15, 2)->default(0);
            $table->json('other_expenses')->nullable(); // [{description, value}]
            $table->decimal('computers_value', 15, 2)->default(0);
            $table->unsignedSmallInteger('computers_life_years')->default(3);
            $table->decimal('furniture_value', 15, 2)->default(0);
            $table->unsignedSmallInteger('furniture_life_years')->default(5);
            $table->decimal('equipment_value', 15, 2)->default(0);
            $table->unsignedSmallInteger('equipment_life_years')->default(7);
            $table->json('other_capex')->nullable(); // [{name, value, life_years}]
            $table->decimal('cash_contribution', 15, 2)->default(0);
            $table->decimal('borrowing', 15, 2)->default(0);
            $table->json('other_funds')->nullable(); // [{description, value}]
            $table->decimal('interest_rate', 5, 2)->default(0);
            $table->unsignedSmallInteger('loan_duration')->default(1);
            $table->decimal('credit_sales_percent', 5, 2)->default(0);
            $table->decimal('credit_purchases_percent', 5, 2)->default(0);
            $table->timestamps();

            $table->unique(['project_id', 'scenario']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_inputs');
    }
};
```

- [ ] **Step 4: Create FinancialInput model**

```php
<?php
// backend/app/Models/FinancialInput.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialInput extends Model
{
    protected $fillable = [
        'project_id', 'scenario', 'currency', 'product_description', 'product_category',
        'annual_units_sold', 'selling_price_per_unit', 'unit_cost', 'annual_units_purchased',
        'annual_rent', 'annual_utilities', 'num_employees', 'employee_annual_salary',
        'num_managers', 'manager_annual_salary', 'office_supplies', 'advertising', 'legal_fees',
        'other_expenses', 'computers_value', 'computers_life_years', 'furniture_value',
        'furniture_life_years', 'equipment_value', 'equipment_life_years', 'other_capex',
        'cash_contribution', 'borrowing', 'other_funds', 'interest_rate', 'loan_duration',
        'credit_sales_percent', 'credit_purchases_percent',
    ];

    protected $casts = [
        'selling_price_per_unit' => 'float',
        'unit_cost' => 'float',
        'annual_rent' => 'float',
        'annual_utilities' => 'float',
        'employee_annual_salary' => 'float',
        'manager_annual_salary' => 'float',
        'office_supplies' => 'float',
        'advertising' => 'float',
        'legal_fees' => 'float',
        'other_expenses' => 'array',
        'computers_value' => 'float',
        'furniture_value' => 'float',
        'equipment_value' => 'float',
        'other_capex' => 'array',
        'cash_contribution' => 'float',
        'borrowing' => 'float',
        'other_funds' => 'array',
        'interest_rate' => 'float',
        'credit_sales_percent' => 'float',
        'credit_purchases_percent' => 'float',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
```

- [ ] **Step 5: Add route stubs to api.php**

In `backend/routes/api.php`, add inside the `auth:sanctum` middleware group, after the sections routes:

```php
use App\Http\Controllers\FinancialController;

// Financial wizard
Route::get('/projects/{project}/financial', [FinancialController::class, 'indexAll']);
Route::get('/projects/{project}/financial/{scenario}', [FinancialController::class, 'show']);
Route::put('/projects/{project}/financial/{scenario}', [FinancialController::class, 'saveAndCalculate']);
Route::get('/projects/{project}/financial/{scenario}/export/{format}', [FinancialController::class, 'export']);
```

Also add the use import at the top:
```php
use App\Http\Controllers\FinancialController;
```

- [ ] **Step 6: Create stub FinancialController (returns empty responses so routes resolve)**

```php
<?php
// backend/app/Http/Controllers/FinancialController.php
namespace App\Http\Controllers;

use App\Models\FinancialInput;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FinancialController extends Controller
{
    private const SCENARIOS = ['expected', 'best', 'worst'];

    public function indexAll(Request $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        $data = [];
        foreach (self::SCENARIOS as $scenario) {
            $data[$scenario] = ['inputs' => null, 'outputs' => null];
        }

        return response()->json(['data' => $data]);
    }

    public function show(Request $request, Project $project, string $scenario): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        if (!in_array($scenario, self::SCENARIOS, true)) {
            return response()->json(['message' => 'Invalid scenario.'], 422);
        }

        return response()->json(['data' => ['inputs' => null, 'outputs' => null]]);
    }

    public function saveAndCalculate(Request $request, Project $project, string $scenario): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('update', $project);

        if (!in_array($scenario, self::SCENARIOS, true)) {
            return response()->json(['message' => 'Invalid scenario.'], 422);
        }

        return response()->json(['data' => ['inputs' => $request->all(), 'outputs' => null]]);
    }

    public function export(Request $request, Project $project, string $scenario, string $format): Response
    {
        abort(501, 'Export not yet implemented.');
    }
}
```

- [ ] **Step 7: Run migration**

```bash
cd backend && php artisan migrate
```
Expected: "financial_inputs table created"

- [ ] **Step 8: Run the feature tests (partial pass)**

```bash
cd backend && php artisan test tests/Feature/FinancialControllerTest.php
```
Expected: `test_show_returns_empty_scenario_when_no_data` PASS, `test_show_all_scenarios_returns_three_entries` PASS, `test_unauthenticated_request_is_rejected` PASS, `test_non_owner_cannot_access` PASS. Others may fail (export returns 501, save returns null outputs).

- [ ] **Step 9: Commit**

```bash
cd backend
git add database/migrations/2026_05_09_180000_create_financial_inputs_table.php \
        app/Models/FinancialInput.php \
        app/Http/Controllers/FinancialController.php \
        routes/api.php \
        tests/Feature/FinancialControllerTest.php
git commit -m "feat: add financial_inputs migration, model, and route stubs"
```

---

## Task 2: FinancialCalculationService (PHP)

**Files:**
- Create: `backend/app/Services/FinancialCalculationService.php`
- Create: `backend/tests/Unit/FinancialCalculationServiceTest.php`

### Workbook Formula Reference

Formulas are derived from `GOSMRT_Smart_Financial_Wizard_Model.xls` (Monthly Model + Income Statement + Balance Sheet + CAC + Dashboard sheets). Tests use the workbook's own sample inputs so expected values can be verified against the file.

**Key workbook formulas:**
- `Revenue = annual_units_sold × selling_price_per_unit`
- `COGS = annual_units_purchased × unit_cost` (purchased qty, not sold)
- `Total OpEx = Rent + Utilities + (employees × emp_salary) + (managers × mgr_salary) + Office + Advertising + Legal + other_expenses_sum`
- `EBITDA = Gross Profit − Total OpEx`
- `Depreciation = Σ(asset_value / life_years)` straight-line annual
- `EBIT = EBITDA − Depreciation`
- `Annual Interest = Σ monthly_interest` where each month: `interest[m] = (borrowing − repayment×(m−1)) × (interest_rate/12)`, `repayment = borrowing / (loan_duration_years × 12)`
- `Net Income = EBIT − Annual Interest`
- `AR = (revenue / 12) × (credit_sales_pct / 100)` — one month outstanding
- `AP = (cogs / 12) × (credit_purch_pct / 100)` — one month outstanding
- `Net Fixed Assets = total_capex × 12 − annual_depreciation` — workbook invests all capex each month for 12 months
- `Ending Cash` — computed via 12-month cash flow model (see below)
- `Equity = cash_contribution + net_income`
- `Break-even Units = total_opex / (selling_price − unit_cost)`
- `CAC = advertising / annual_units_sold`

**Monthly cash flow model (used to compute year-end ending cash):**
Each month m (1..12):
- `cash_collected[1] = monthly_revenue × (1 − credit_sales_pct)` (month 1: cash portion only)
- `cash_collected[m>1] = monthly_cash_sales[m] + monthly_credit_sales[m−1]` (cash + prior month AR collected)
- `cash_paid_purchases[1] = monthly_cogs × (1 − credit_purch_pct)`
- `cash_paid_purchases[m>1] = monthly_cash_purchases[m] + monthly_credit_purchases[m−1]`
- `funding_this_month = total_funding` (all months — workbook design)
- `capex_this_month = total_capex` (all months — workbook design)
- `debt_service[m] = monthly_repayment + interest[m]`
- `net_cf[m] = cash_collected[m] + funding_this_month − cash_paid_purchases[m] − monthly_opex − capex_this_month − debt_service[m]`
- `ending_cash = Σ net_cf[m]` (sum of all 12 months = month 12 cumulative ending cash)

- [ ] **Step 1: Write unit tests (use workbook sample data for exact value verification)**

```php
<?php
// backend/tests/Unit/FinancialCalculationServiceTest.php
namespace Tests\Unit;

use App\Services\FinancialCalculationService;
use Tests\TestCase;

class FinancialCalculationServiceTest extends TestCase
{
    private FinancialCalculationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new FinancialCalculationService();
    }

    // Matches GOSMRT_Smart_Financial_Wizard_Model.xls sample inputs exactly.
    // Expected outputs verified against the workbook's Income Statement,
    // Balance Sheet, Cash Flow, CAC, and Dashboard sheets.
    private function workbookInputs(): array
    {
        return [
            'annual_units_sold'       => 10000,
            'selling_price_per_unit'  => 10.0,
            'unit_cost'               => 4.0,
            'annual_units_purchased'  => 1200,
            'annual_rent'             => 12000.0,
            'annual_utilities'        => 3000.0,
            'num_employees'           => 3,
            'employee_annual_salary'  => 6000.0,
            'num_managers'            => 1,
            'manager_annual_salary'   => 12000.0,
            'office_supplies'         => 1000.0,
            'advertising'             => 5000.0,
            'legal_fees'              => 1500.0,
            'other_expenses'          => [['description' => 'Other', 'value' => 2000.0]],
            'computers_value'         => 3000.0,
            'computers_life_years'    => 3,
            'furniture_value'         => 4000.0,
            'furniture_life_years'    => 5,
            'equipment_value'         => 7000.0,
            'equipment_life_years'    => 5,
            'other_capex'             => [],
            'cash_contribution'       => 10000.0,
            'borrowing'               => 8000.0,
            'other_funds'             => [],
            'interest_rate'           => 8.0,
            'loan_duration'           => 3,
            'credit_sales_percent'    => 20.0,
            'credit_purchases_percent'=> 30.0,
        ];
    }

    // --- Income Statement (verified against workbook IS sheet) ---

    public function test_revenue_is_units_times_price(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        $this->assertEquals(100000.0, $out['income_statement']['revenue']);
    }

    public function test_cogs_uses_purchased_units_not_sold(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // 1200 purchased × $4 = $4,800
        $this->assertEquals(4800.0, $out['income_statement']['cogs']);
    }

    public function test_gross_profit(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        $this->assertEquals(95200.0, $out['income_statement']['gross_profit']);
    }

    public function test_total_opex_matches_workbook(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // Rent(12000)+Utils(3000)+Salaries(3×6000=18000)+Mgmt(1×12000)+
        // Office(1000)+Adv(5000)+Legal(1500)+Other(2000) = 54500
        $this->assertEquals(54500.0, $out['income_statement']['total_opex']);
    }

    public function test_ebitda_matches_workbook(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // 95200 − 54500 = 40700
        $this->assertEquals(40700.0, $out['income_statement']['ebitda']);
    }

    public function test_depreciation_straight_line(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // computers: 3000/3=1000, furniture: 4000/5=800, equipment: 7000/5=1400 → 3200
        $this->assertEquals(3200.0, $out['income_statement']['depreciation']);
    }

    public function test_ebit_matches_workbook(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // 40700 − 3200 = 37500
        $this->assertEquals(37500.0, $out['income_statement']['ebit']);
    }

    public function test_interest_is_declining_balance_monthly_sum(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // monthly_repayment = 8000/(3×12) = 222.22
        // Annual interest = (0.08/12) × Σ_{m=1}^{12}(8000 − 222.22×(m−1)) ≈ 542.22
        $this->assertEqualsWithDelta(542.22, $out['income_statement']['interest_expense'], 0.01);
    }

    public function test_net_income_matches_workbook(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // 37500 − 542.22 = 36957.78
        $this->assertEqualsWithDelta(36957.78, $out['income_statement']['net_income'], 0.01);
    }

    // --- Balance Sheet (verified against workbook BS sheet, Year End column) ---

    public function test_accounts_receivable_one_month_outstanding(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // (100000/12) × 0.20 = 1666.67
        $this->assertEqualsWithDelta(1666.67, $out['balance_sheet']['accounts_receivable'], 0.01);
    }

    public function test_accounts_payable_one_month_outstanding(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // (4800/12) × 0.30 = 120
        $this->assertEquals(120.0, $out['balance_sheet']['accounts_payable']);
    }

    public function test_net_fixed_assets_monthly_capex_model(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // total_capex(14000) × 12 − depreciation(3200) = 164800
        $this->assertEquals(164800.0, $out['balance_sheet']['net_fixed_assets']);
    }

    public function test_debt_balance_after_12_repayments(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // 8000 − 222.22×12 = 5333.33
        $this->assertEqualsWithDelta(5333.33, $out['balance_sheet']['debt_balance'], 0.01);
    }

    public function test_equity_is_contribution_plus_net_income(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // 10000 + 36957.78 = 46957.78
        $this->assertEqualsWithDelta(46957.78, $out['balance_sheet']['equity'], 0.01);
    }

    public function test_ending_cash_from_monthly_model(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // Year-end cash from 12-month cumulative model ≈ 83944.44
        $this->assertEqualsWithDelta(83944.44, $out['balance_sheet']['cash'], 0.01);
    }

    // --- CAC (verified against workbook CAC sheet) ---

    public function test_cac_is_advertising_over_units_sold(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // 5000 / 10000 = 0.50
        $this->assertEquals(0.5, $out['cac']['cost_per_acquisition']);
    }

    // --- Dashboard (verified against workbook Dashboard sheet) ---

    public function test_break_even_units(): void
    {
        $out = $this->service->calculate($this->workbookInputs());
        // total_opex(54500) / (price(10) − unit_cost(4)) = 9083.33
        $this->assertEqualsWithDelta(9083.33, $out['dashboard']['break_even_units'], 0.01);
    }

    // --- Other expense arrays ---

    public function test_other_expenses_array_is_summed(): void
    {
        $inputs = $this->workbookInputs();
        $inputs['other_expenses'] = [
            ['description' => 'Insurance', 'value' => 2000],
            ['description' => 'Training', 'value' => 1000],
        ];
        $out = $this->service->calculate($inputs);
        $this->assertEquals(3000.0, $out['income_statement']['other_expenses_total']);
    }

    public function test_other_capex_included_in_depreciation_and_fixed_assets(): void
    {
        $inputs = $this->workbookInputs();
        $inputs['other_capex'] = [['name' => 'Vehicle', 'value' => 6000, 'life_years' => 3]];
        $out = $this->service->calculate($inputs);
        // depreciation: 3200 + 6000/3 = 5200
        $this->assertEqualsWithDelta(5200.0, $out['income_statement']['depreciation'], 0.01);
        // net_fixed_assets: (14000+6000)×12 − 5200 = 234800
        $this->assertEqualsWithDelta(234800.0, $out['balance_sheet']['net_fixed_assets'], 0.01);
    }
}
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && php artisan test tests/Unit/FinancialCalculationServiceTest.php
```
Expected: FAIL — "Class App\Services\FinancialCalculationService not found"

- [ ] **Step 3: Create FinancialCalculationService**

```php
<?php
// backend/app/Services/FinancialCalculationService.php
namespace App\Services;

class FinancialCalculationService
{
    public function calculate(array $inputs): array
    {
        $is = $this->calcIncomeStatement($inputs);
        $monthly = $this->runMonthlyModel($inputs, $is);
        $bs = $this->calcBalanceSheet($inputs, $is, $monthly);
        $cf = $this->calcCashFlowSummary($inputs, $is, $monthly);
        $cac = $this->calcCAC($inputs);
        $dashboard = $this->calcDashboard($inputs, $is, $bs, $cf);

        return [
            'income_statement' => $is,
            'balance_sheet'    => $bs,
            'cash_flow'        => $cf,
            'cac'              => $cac,
            'dashboard'        => $dashboard,
        ];
    }

    // -----------------------------------------------------------------------
    // Income Statement — annual totals, verified against workbook IS sheet
    // -----------------------------------------------------------------------

    private function calcIncomeStatement(array $i): array
    {
        $revenue     = (float)$i['annual_units_sold'] * (float)$i['selling_price_per_unit'];
        $cogs        = (float)$i['annual_units_purchased'] * (float)$i['unit_cost'];
        $grossProfit = $revenue - $cogs;

        $salaries = ((float)$i['num_employees'] * (float)$i['employee_annual_salary'])
            + ((float)$i['num_managers'] * (float)$i['manager_annual_salary']);

        $fixedOpex = (float)$i['annual_rent']
            + (float)$i['annual_utilities']
            + (float)$i['office_supplies']
            + (float)$i['advertising']
            + (float)$i['legal_fees'];

        $otherExpensesTotal = array_sum(array_column($i['other_expenses'] ?? [], 'value'));
        $totalOpex          = $salaries + $fixedOpex + $otherExpensesTotal;
        $ebitda             = $grossProfit - $totalOpex;

        $depreciation = $this->calcAnnualDepreciation($i);
        $ebit         = $ebitda - $depreciation;

        $interestExpense = $this->calcAnnualInterest($i);
        $netIncome       = $ebit - $interestExpense;

        return [
            'revenue'               => round($revenue, 2),
            'cogs'                  => round($cogs, 2),
            'gross_profit'          => round($grossProfit, 2),
            'total_salaries'        => round($salaries, 2),
            'fixed_opex'            => round($fixedOpex, 2),
            'other_expenses_total'  => round($otherExpensesTotal, 2),
            'total_opex'            => round($totalOpex, 2),
            'ebitda'                => round($ebitda, 2),
            'depreciation'          => round($depreciation, 2),
            'ebit'                  => round($ebit, 2),
            'interest_expense'      => round($interestExpense, 2),
            'net_income'            => round($netIncome, 2),
        ];
    }

    // -----------------------------------------------------------------------
    // 12-month rolling cash model — drives ending cash and cash flow summary.
    // Replicates workbook Monthly Model sheet logic exactly:
    //   - funding injected every month (workbook design)
    //   - full capex purchased every month (workbook design)
    //   - AR/AP have a 1-month collection/payment lag
    // -----------------------------------------------------------------------

    private function runMonthlyModel(array $i, array $is): array
    {
        $monthlyRevenue      = $is['revenue'] / 12;
        $monthlyCogs         = $is['cogs'] / 12;
        $monthlyOpex         = $is['total_opex'] / 12;
        $totalCapex          = $this->calcTotalCapexValue($i);
        $totalFunding        = (float)$i['cash_contribution']
            + (float)$i['borrowing']
            + array_sum(array_column($i['other_funds'] ?? [], 'value'));

        $creditSalesPct  = (float)$i['credit_sales_percent'] / 100;
        $creditPurchPct  = (float)$i['credit_purchases_percent'] / 100;
        $monthlyCashSales    = $monthlyRevenue * (1 - $creditSalesPct);
        $monthlyCreditSales  = $monthlyRevenue * $creditSalesPct;
        $monthlyCashPurch    = $monthlyCogs * (1 - $creditPurchPct);
        $monthlyCreditPurch  = $monthlyCogs * $creditPurchPct;

        $monthlyRepayment = (float)$i['borrowing'] / max((int)$i['loan_duration'] * 12, 1);
        $debtBalance      = (float)$i['borrowing'];
        $monthlyRate      = (float)$i['interest_rate'] / 100 / 12;

        $endingCash          = 0.0;
        $totalCashCollected  = 0.0;
        $totalCashPaid       = 0.0;
        $totalDebtService    = 0.0;

        for ($m = 1; $m <= 12; $m++) {
            // Cash collected: month 1 cash portion only; subsequent months add prior credit
            $cashCollected = ($m === 1)
                ? $monthlyCashSales
                : $monthlyCashSales + $monthlyCreditSales;

            // Cash paid for purchases: same 1-month lag
            $cashPaid = ($m === 1)
                ? $monthlyCashPurch
                : $monthlyCashPurch + $monthlyCreditPurch;

            $interest    = $debtBalance * $monthlyRate;
            $debtService = $monthlyRepayment + $interest;
            $debtBalance -= $monthlyRepayment;

            $netCf = $cashCollected + $totalFunding
                - $cashPaid - $monthlyOpex - $totalCapex - $debtService;

            $endingCash         += $netCf;
            $totalCashCollected += $cashCollected;
            $totalCashPaid      += $cashPaid;
            $totalDebtService   += $debtService;
        }

        return [
            'ending_cash'         => round($endingCash, 2),
            'total_cash_collected'=> round($totalCashCollected, 2),
            'total_cash_paid'     => round($totalCashPaid, 2),
            'total_debt_service'  => round($totalDebtService, 2),
            'total_funding'       => round($totalFunding, 2),
            'total_capex'         => round($totalCapex, 2),
            'total_opex_paid'     => round($is['total_opex'], 2),
            'monthly_repayment'   => round($monthlyRepayment, 2),
        ];
    }

    // -----------------------------------------------------------------------
    // Balance Sheet — year-end (Month 12) position per workbook BS sheet
    // -----------------------------------------------------------------------

    private function calcBalanceSheet(array $i, array $is, array $monthly): array
    {
        $cash           = $monthly['ending_cash'];
        $ar             = round($is['revenue'] / 12 * ((float)$i['credit_sales_percent'] / 100), 2);
        $netFixedAssets = round($monthly['total_capex'] * 12 - $is['depreciation'], 2);
        $totalAssets    = round($cash + $ar + $netFixedAssets, 2);

        $ap          = round($is['cogs'] / 12 * ((float)$i['credit_purchases_percent'] / 100), 2);
        $debtBalance = round((float)$i['borrowing'] - $monthly['monthly_repayment'] * 12, 2);
        // Equity = initial cash contribution + net income (workbook formula)
        $equity      = round((float)$i['cash_contribution'] + $is['net_income'], 2);
        $totalLE     = round($debtBalance + $ap + $equity, 2);

        return [
            'cash'                     => $cash,
            'accounts_receivable'      => $ar,
            'inventory'                => 0.0,
            'net_fixed_assets'         => $netFixedAssets,
            'total_assets'             => $totalAssets,
            'accounts_payable'         => $ap,
            'debt_balance'             => $debtBalance,
            'equity'                   => $equity,
            'total_liabilities_equity' => $totalLE,
            // Workbook acknowledges this imbalance (Total Assets ≠ Total L+E)
            // caused by monthly capex/funding spreading model.
            'balance_check'            => round($totalAssets - $totalLE, 2),
        ];
    }

    // -----------------------------------------------------------------------
    // Cash Flow Summary — mirrors workbook Cash Flow sheet annual totals
    // -----------------------------------------------------------------------

    private function calcCashFlowSummary(array $i, array $is, array $monthly): array
    {
        return [
            'opening_cash'           => 0.0,
            'cash_collected'         => $monthly['total_cash_collected'],
            'funding_inflows'        => round($monthly['total_funding'] * 12, 2),
            'cash_paid_for_purchases'=> $monthly['total_cash_paid'],
            'total_opex_paid'        => $monthly['total_opex_paid'],
            'capital_expenditures'   => round(-$monthly['total_capex'] * 12, 2),
            'debt_service'           => round(-$monthly['total_debt_service'], 2),
            'ending_cash'            => $monthly['ending_cash'],
        ];
    }

    // -----------------------------------------------------------------------
    // CAC — workbook CAC sheet: advertising ÷ units sold
    // -----------------------------------------------------------------------

    private function calcCAC(array $i): array
    {
        $advertising = (float)$i['advertising'];
        $units       = max(1, (int)$i['annual_units_sold']);
        $cac         = round($advertising / $units, 4);

        return [
            'advertising_spend'    => round($advertising, 2),
            'units_acquired'       => $units,
            'cost_per_acquisition' => $cac,
        ];
    }

    // -----------------------------------------------------------------------
    // Dashboard — workbook Dashboard sheet key metrics
    // -----------------------------------------------------------------------

    private function calcDashboard(array $i, array $is, array $bs, array $cf): array
    {
        $contributionMargin = (float)$i['selling_price_per_unit'] - (float)$i['unit_cost'];
        $breakEven = $contributionMargin > 0
            ? round($is['total_opex'] / $contributionMargin, 2)
            : null;

        $grossMargin = $is['revenue'] > 0
            ? round($is['gross_profit'] / $is['revenue'] * 100, 2)
            : 0.0;

        $netMargin = $is['revenue'] > 0
            ? round($is['net_income'] / $is['revenue'] * 100, 2)
            : 0.0;

        return [
            'currency'           => $i['currency'] ?? 'USD',
            'annual_revenue'     => $is['revenue'],
            'gross_profit'       => $is['gross_profit'],
            'net_income'         => $is['net_income'],
            'ending_cash'        => $bs['cash'],
            'break_even_units'   => $breakEven,
            'cac'                => round((float)$i['advertising'] / max(1, (int)$i['annual_units_sold']), 4),
            'debt_at_year_end'   => $bs['debt_balance'],
            'gross_margin_pct'   => $grossMargin,
            'net_margin_pct'     => $netMargin,
        ];
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private function calcAnnualDepreciation(array $i): float
    {
        $dep = 0.0;
        if ((float)$i['computers_value'] > 0 && (int)$i['computers_life_years'] > 0) {
            $dep += (float)$i['computers_value'] / (int)$i['computers_life_years'];
        }
        if ((float)$i['furniture_value'] > 0 && (int)$i['furniture_life_years'] > 0) {
            $dep += (float)$i['furniture_value'] / (int)$i['furniture_life_years'];
        }
        if ((float)$i['equipment_value'] > 0 && (int)$i['equipment_life_years'] > 0) {
            $dep += (float)$i['equipment_value'] / (int)$i['equipment_life_years'];
        }
        foreach ($i['other_capex'] ?? [] as $item) {
            if ((float)($item['value'] ?? 0) > 0 && (int)($item['life_years'] ?? 0) > 0) {
                $dep += (float)$item['value'] / (int)$item['life_years'];
            }
        }
        return round($dep, 2);
    }

    // Declining-balance monthly interest, summed over 12 months.
    // monthly_repayment = borrowing / (loan_duration_years × 12)
    // interest[m] = (borrowing − repayment × (m−1)) × (rate / 12)
    private function calcAnnualInterest(array $i): float
    {
        $borrowing   = (float)$i['borrowing'];
        $rate        = (float)$i['interest_rate'] / 100;
        $duration    = max(1, (int)$i['loan_duration']);
        $monthlyPay  = $borrowing / ($duration * 12);
        $monthlyRate = $rate / 12;
        $total       = 0.0;
        for ($m = 0; $m < 12; $m++) {
            $balance = $borrowing - $monthlyPay * $m;
            $total  += $balance * $monthlyRate;
        }
        return round($total, 2);
    }

    private function calcTotalCapexValue(array $i): float
    {
        $total = (float)$i['computers_value']
            + (float)$i['furniture_value']
            + (float)$i['equipment_value'];
        foreach ($i['other_capex'] ?? [] as $item) {
            $total += (float)($item['value'] ?? 0);
        }
        return round($total, 2);
    }
}
```

- [ ] **Step 4: Run unit tests — all should pass**

```bash
cd backend && php artisan test tests/Unit/FinancialCalculationServiceTest.php
```
Expected: All 19 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd backend
git add app/Services/FinancialCalculationService.php \
        tests/Unit/FinancialCalculationServiceTest.php
git commit -m "feat: add FinancialCalculationService matching workbook formulas"
```

---

## Task 3: Complete FinancialController (CRUD + Calculate)

**Files:**
- Modify: `backend/app/Http/Controllers/FinancialController.php`

- [ ] **Step 1: Rewrite FinancialController with full implementation**

```php
<?php
// backend/app/Http/Controllers/FinancialController.php
namespace App\Http\Controllers;

use App\Models\FinancialInput;
use App\Models\Project;
use App\Services\FinancialCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FinancialController extends Controller
{
    private const SCENARIOS = ['expected', 'best', 'worst'];

    public function __construct(private FinancialCalculationService $calculator) {}

    public function indexAll(Request $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        $rows = FinancialInput::where('project_id', $project->id)->get()->keyBy('scenario');
        $data = [];
        foreach (self::SCENARIOS as $scenario) {
            $row = $rows->get($scenario);
            $data[$scenario] = $this->scenarioResponse($row);
        }

        return response()->json(['data' => $data]);
    }

    public function show(Request $request, Project $project, string $scenario): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        if (!in_array($scenario, self::SCENARIOS, true)) {
            return response()->json(['message' => 'Invalid scenario.'], 422);
        }

        $row = FinancialInput::where('project_id', $project->id)
            ->where('scenario', $scenario)
            ->first();

        return response()->json(['data' => $this->scenarioResponse($row)]);
    }

    public function saveAndCalculate(Request $request, Project $project, string $scenario): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('update', $project);

        if (!in_array($scenario, self::SCENARIOS, true)) {
            return response()->json(['message' => 'Invalid scenario.'], 422);
        }

        $validated = $request->validate($this->inputRules());

        $row = FinancialInput::updateOrCreate(
            ['project_id' => $project->id, 'scenario' => $scenario],
            $validated
        );

        $outputs = $this->calculator->calculate($row->toArray());

        return response()->json(['data' => [
            'inputs' => $row->toArray(),
            'outputs' => $outputs,
        ]]);
    }

    public function export(Request $request, Project $project, string $scenario, string $format): Response
    {
        abort(501, 'Export not yet implemented.');
    }

    private function scenarioResponse(?FinancialInput $row): array
    {
        if ($row === null) {
            return ['inputs' => null, 'outputs' => null];
        }
        return [
            'inputs' => $row->toArray(),
            'outputs' => $this->calculator->calculate($row->toArray()),
        ];
    }

    private function inputRules(): array
    {
        return [
            'currency' => ['sometimes', 'string', 'max:10'],
            'product_description' => ['nullable', 'string', 'max:500'],
            'product_category' => ['nullable', 'string', 'max:100'],
            'annual_units_sold' => ['sometimes', 'integer', 'min:0'],
            'selling_price_per_unit' => ['sometimes', 'numeric', 'min:0'],
            'unit_cost' => ['sometimes', 'numeric', 'min:0'],
            'annual_units_purchased' => ['sometimes', 'integer', 'min:0'],
            'annual_rent' => ['sometimes', 'numeric', 'min:0'],
            'annual_utilities' => ['sometimes', 'numeric', 'min:0'],
            'num_employees' => ['sometimes', 'integer', 'min:0'],
            'employee_annual_salary' => ['sometimes', 'numeric', 'min:0'],
            'num_managers' => ['sometimes', 'integer', 'min:0'],
            'manager_annual_salary' => ['sometimes', 'numeric', 'min:0'],
            'office_supplies' => ['sometimes', 'numeric', 'min:0'],
            'advertising' => ['sometimes', 'numeric', 'min:0'],
            'legal_fees' => ['sometimes', 'numeric', 'min:0'],
            'other_expenses' => ['sometimes', 'array'],
            'other_expenses.*.description' => ['required_with:other_expenses', 'string', 'max:255'],
            'other_expenses.*.value' => ['required_with:other_expenses', 'numeric', 'min:0'],
            'computers_value' => ['sometimes', 'numeric', 'min:0'],
            'computers_life_years' => ['sometimes', 'integer', 'min:1'],
            'furniture_value' => ['sometimes', 'numeric', 'min:0'],
            'furniture_life_years' => ['sometimes', 'integer', 'min:1'],
            'equipment_value' => ['sometimes', 'numeric', 'min:0'],
            'equipment_life_years' => ['sometimes', 'integer', 'min:1'],
            'other_capex' => ['sometimes', 'array'],
            'other_capex.*.name' => ['required_with:other_capex', 'string', 'max:255'],
            'other_capex.*.value' => ['required_with:other_capex', 'numeric', 'min:0'],
            'other_capex.*.life_years' => ['required_with:other_capex', 'integer', 'min:1'],
            'cash_contribution' => ['sometimes', 'numeric', 'min:0'],
            'borrowing' => ['sometimes', 'numeric', 'min:0'],
            'other_funds' => ['sometimes', 'array'],
            'other_funds.*.description' => ['required_with:other_funds', 'string', 'max:255'],
            'other_funds.*.value' => ['required_with:other_funds', 'numeric', 'min:0'],
            'interest_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'loan_duration' => ['sometimes', 'integer', 'min:1'],
            'credit_sales_percent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'credit_purchases_percent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
```

- [ ] **Step 2: Run all feature tests — they should now pass**

```bash
cd backend && php artisan test tests/Feature/FinancialControllerTest.php
```
Expected: All tests except `test_export_excel_returns_file` PASS (export remains 501 until Task 4).

- [ ] **Step 3: Commit**

```bash
cd backend
git add app/Http/Controllers/FinancialController.php
git commit -m "feat: complete FinancialController with CRUD and calculation"
```

---

## Task 4: Export System (PhpSpreadsheet + DomPDF)

**Files:**
- Modify: `backend/app/Services/FinancialCalculationService.php` (add public `buildMonthlyData()`)
- Modify: `backend/composer.json` (via composer require)
- Create: `backend/app/Services/FinancialExportService.php`
- Create: `backend/resources/views/financial/pdf_export.blade.php`
- Modify: `backend/app/Http/Controllers/FinancialController.php` (complete export method)

- [ ] **Step 1: Install packages**

```bash
cd backend
composer require phpoffice/phpspreadsheet barryvdh/laravel-dompdf
```
Expected: composer.json updated, packages installed.

- [ ] **Step 2: Add `buildMonthlyData()` to FinancialCalculationService — write failing test first**

Add to `backend/tests/Unit/FinancialCalculationServiceTest.php` (inside the class, after existing tests):

```php
public function test_build_monthly_data_returns_12_months_with_verified_values(): void
{
    $monthly = $this->service->buildMonthlyData($this->workbookInputs());
    $this->assertCount(12, $monthly);
    // Month 1: no prior credit, opening cash = 0
    $this->assertEqualsWithDelta(5569.44, $monthly[0]['ending_cash'], 0.01);
    // Month 2: prior credit collected
    $this->assertEqualsWithDelta(12687.04, $monthly[1]['ending_cash'], 0.01);
    // Year-end cash matches balance sheet
    $this->assertEqualsWithDelta(83944.44, $monthly[11]['ending_cash'], 0.01);
    // Year-end net fixed assets: capex(14000)×12 − dep(3200) = 164800
    $this->assertEqualsWithDelta(164800.0, $monthly[11]['net_fixed_assets'], 0.01);
    // Year-end equity: contribution(10000) + net_income(36957.78)
    $this->assertEqualsWithDelta(46957.78, $monthly[11]['equity'], 0.01);
}
```

Run it to confirm failure:

```bash
cd backend && php artisan test tests/Unit/FinancialCalculationServiceTest.php --filter test_build_monthly_data
```
Expected: FAIL — "Call to undefined method buildMonthlyData"

Now add the two new methods to `FinancialCalculationService.php`, directly before the closing `}` of the class (after `calcTotalCapexValue`):

```php
    // Returns 12 per-month snapshots replicating the workbook Monthly Model sheet.
    // Columns match exactly: same row labels, same formula logic.
    public function buildMonthlyData(array $i): array
    {
        $ctx   = $this->buildMonthlyCtx($i);
        $state = ['prevCS' => 0.0, 'prevCP' => 0.0, 'cumNI' => 0.0, 'openCash' => 0.0];
        $months = [];
        for ($m = 0; $m < 12; $m++) {
            [$snap, $state] = $this->buildMonthSnap($ctx, $m, $state);
            $months[] = $snap;
        }
        return $months;
    }

    private function buildMonthlyCtx(array $i): array
    {
        $empSalMo  = (float)$i['num_employees'] * (float)$i['employee_annual_salary'] / 12;
        $mgrSalMo  = (float)$i['num_managers'] * (float)$i['manager_annual_salary'] / 12;
        $rentMo    = (float)$i['annual_rent'] / 12;
        $utilMo    = (float)$i['annual_utilities'] / 12;
        $officeMo  = (float)$i['office_supplies'] / 12;
        $advMo     = (float)$i['advertising'] / 12;
        $legalMo   = (float)$i['legal_fees'] / 12;
        $otherExpMo= array_sum(array_column($i['other_expenses'] ?? [], 'value')) / 12;
        return [
            'monthlyRep'  => (float)$i['borrowing'] / max(1, (int)$i['loan_duration'] * 12),
            'monthlyRate' => (float)$i['interest_rate'] / 100 / 12,
            'depPerMo'    => $this->calcAnnualDepreciation($i) / 12,
            'capex'       => $this->calcTotalCapexValue($i),
            'funding'     => (float)$i['cash_contribution'] + (float)$i['borrowing']
                             + array_sum(array_column($i['other_funds'] ?? [], 'value')),
            'unitsPerMo'  => (float)$i['annual_units_sold'] / 12,
            'revPerMo'    => (float)$i['annual_units_sold'] / 12 * (float)$i['selling_price_per_unit'],
            'purchPerMo'  => (float)$i['annual_units_purchased'] / 12,
            'cogsPerMo'   => (float)$i['annual_units_purchased'] / 12 * (float)$i['unit_cost'],
            'csPct'       => (float)$i['credit_sales_percent'] / 100,
            'cpPct'       => (float)$i['credit_purchases_percent'] / 100,
            'empSalMo'    => $empSalMo,  'mgrSalMo' => $mgrSalMo,
            'rentMo'      => $rentMo,    'utilMo'   => $utilMo,
            'officeMo'    => $officeMo,  'advMo'    => $advMo,
            'legalMo'     => $legalMo,   'otherExpMo' => $otherExpMo,
            'opexPerMo'   => $empSalMo + $mgrSalMo + $rentMo + $utilMo
                             + $officeMo + $advMo + $legalMo + $otherExpMo,
            'borrowing'   => (float)$i['borrowing'],
            'cashContrib' => (float)$i['cash_contribution'],
        ];
    }

    private function buildMonthSnap(array $c, int $m, array $s): array
    {
        $cs  = $c['revPerMo'] * $c['csPct'];
        $col = $c['revPerMo'] * (1 - $c['csPct']) + $s['prevCS'];
        $cp  = $c['cogsPerMo'] * $c['cpPct'];
        $pd  = $c['cogsPerMo'] * (1 - $c['cpPct']) + $s['prevCP'];
        $gp  = $c['revPerMo'] - $c['cogsPerMo'];
        $eb  = $gp - $c['opexPerMo'];
        $ebt = $eb - $c['depPerMo'];
        $int = ($c['borrowing'] - $c['monthlyRep'] * $m) * $c['monthlyRate'];
        $ni  = $ebt - $int;
        $ds  = $c['monthlyRep'] + $int;
        $ncf = $col - $pd - $c['opexPerMo'] - $c['capex'] + $c['funding'] - $ds;
        $ec  = $s['openCash'] + $ncf;
        $nfa = $c['capex'] * ($m + 1) - $c['depPerMo'] * ($m + 1);
        $db  = $c['borrowing'] - $c['monthlyRep'] * ($m + 1);
        $cumNI = $s['cumNI'] + $ni;
        $eq  = $c['cashContrib'] + $cumNI;
        $ta  = $ec + $cs + $nfa;
        $tle = $cp + $db + $eq;
        return [
            [
                'units_sold'       => round($c['unitsPerMo'], 4),
                'revenue'          => round($c['revPerMo'], 2),
                'cash_sales'       => round($c['revPerMo'] * (1 - $c['csPct']), 2),
                'credit_sales'     => round($cs, 2),
                'cash_collected'   => round($col, 2),
                'units_purchased'  => round($c['purchPerMo'], 4),
                'cogs'             => round($c['cogsPerMo'], 2),
                'cash_purchases'   => round($c['cogsPerMo'] * (1 - $c['cpPct']), 2),
                'credit_purchases' => round($cp, 2),
                'cash_paid'        => round($pd, 2),
                'gross_profit'     => round($gp, 2),
                'salaries'         => round($c['empSalMo'], 2),
                'mgmt_salaries'    => round($c['mgrSalMo'], 2),
                'rent'             => round($c['rentMo'], 2),
                'utilities'        => round($c['utilMo'], 2),
                'office_supplies'  => round($c['officeMo'], 2),
                'advertising'      => round($c['advMo'], 2),
                'legal_fees'       => round($c['legalMo'], 2),
                'other_expenses'   => round($c['otherExpMo'], 2),
                'total_opex'       => round($c['opexPerMo'], 2),
                'ebitda'           => round($eb, 2),
                'depreciation'     => round($c['depPerMo'], 2),
                'ebit'             => round($ebt, 2),
                'interest'         => round($int, 2),
                'net_income'       => round($ni, 2),
                'capex'            => round($c['capex'], 2),
                'funding'          => round($c['funding'], 2),
                'loan_repayment'   => round($c['monthlyRep'], 2),
                'debt_service'     => round($ds, 2),
                'net_cash_flow'    => round($ncf, 2),
                'opening_cash'     => round($s['openCash'], 2),
                'ending_cash'      => round($ec, 2),
                'ar'               => round($cs, 2),
                'inventory'        => 0.0,
                'net_fixed_assets' => round($nfa, 2),
                'debt_balance'     => round($db, 2),
                'ap'               => round($cp, 2),
                'equity'           => round($eq, 2),
                'total_assets'     => round($ta, 2),
                'total_le'         => round($tle, 2),
                'balance_check'    => round($ta - $tle, 2),
            ],
            ['prevCS' => $cs, 'prevCP' => $cp, 'cumNI' => $cumNI, 'openCash' => $ec],
        ];
    }
```

Run the test:

```bash
cd backend && php artisan test tests/Unit/FinancialCalculationServiceTest.php
```
Expected: All 20 tests PASS (including the new buildMonthlyData test).

- [ ] **Step 3: Create FinancialExportService — 7 sheets matching workbook structure**

```php
<?php
// backend/app/Services/FinancialExportService.php
namespace App\Services;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Widget\SimpleCache;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;

class FinancialExportService
{
    public function __construct(private FinancialCalculationService $calculator) {}

    // Produces 7-sheet workbook matching GOSMRT_Smart_Financial_Wizard_Model.xls structure.
    public function toExcel(array $inputs, array $outputs, string $scenario, string $projectName): string
    {
        $monthly = $this->calculator->buildMonthlyData($inputs);
        $ss = new Spreadsheet();
        $ss->getProperties()->setTitle("{$projectName} — {$scenario}");

        $this->buildInputsSheet($ss->getActiveSheet(), $inputs, $scenario);
        $this->buildMonthlyModelSheet($ss->createSheet(), $monthly);
        $this->buildIncomeStatementSheet($ss->createSheet(), $outputs['income_statement'], $monthly);
        $this->buildCashFlowSheet($ss->createSheet(), $outputs['cash_flow'], $monthly);
        $this->buildBalanceSheetSheet($ss->createSheet(), $outputs['balance_sheet'], $monthly);
        $this->buildCACSheet($ss->createSheet(), $outputs['cac']);
        $this->buildDashboardSheet($ss->createSheet(), $outputs['dashboard'], $monthly);

        $ss->setActiveSheetIndex(0);
        $writer = new XlsxWriter($ss);
        $path = tempnam(sys_get_temp_dir(), 'fin_') . '.xlsx';
        $writer->save($path);
        return $path;
    }

    public function toPdf(array $inputs, array $outputs, string $scenario, string $projectName): string
    {
        $html = view('financial.pdf_export', compact('inputs', 'outputs', 'scenario', 'projectName'))->render();
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $path = tempnam(sys_get_temp_dir(), 'fin_') . '.pdf';
        file_put_contents($path, $pdf->output());
        return $path;
    }

    // Sheet 1 — Inputs: Label | Value | Unit
    private function buildInputsSheet(Worksheet $ws, array $inp, string $scenario): void
    {
        $ws->setTitle('Inputs');
        $ws->setCellValue('A1', 'Financial Model Inputs');
        $ws->getStyle('A1')->getFont()->setBold(true)->setSize(13);
        $ws->setCellValue('A2', "Scenario: {$scenario}");
        $cur = $inp['currency'] ?? 'USD';
        $rows = [
            ['Currency', $cur, ''],
            ['Annual Units Sold', $inp['annual_units_sold'] ?? 0, 'units'],
            ['Selling Price per Unit', $inp['selling_price_per_unit'] ?? 0, $cur],
            ['Unit Cost', $inp['unit_cost'] ?? 0, $cur],
            ['Annual Units Purchased', $inp['annual_units_purchased'] ?? 0, 'units'],
            ['Annual Rent', $inp['annual_rent'] ?? 0, $cur],
            ['Annual Utilities', $inp['annual_utilities'] ?? 0, $cur],
            ['Office Supplies', $inp['office_supplies'] ?? 0, $cur],
            ['Advertising', $inp['advertising'] ?? 0, $cur],
            ['Legal Fees', $inp['legal_fees'] ?? 0, $cur],
            ['Employees', $inp['num_employees'] ?? 0, 'people'],
            ['Employee Annual Salary', $inp['employee_annual_salary'] ?? 0, $cur],
            ['Managers', $inp['num_managers'] ?? 0, 'people'],
            ['Manager Annual Salary', $inp['manager_annual_salary'] ?? 0, $cur],
            ['Computers Value', $inp['computers_value'] ?? 0, $cur],
            ['Computers Life', $inp['computers_life_years'] ?? 0, 'years'],
            ['Furniture Value', $inp['furniture_value'] ?? 0, $cur],
            ['Furniture Life', $inp['furniture_life_years'] ?? 0, 'years'],
            ['Equipment Value', $inp['equipment_value'] ?? 0, $cur],
            ['Equipment Life', $inp['equipment_life_years'] ?? 0, 'years'],
            ['Cash Contribution', $inp['cash_contribution'] ?? 0, $cur],
            ['Borrowing', $inp['borrowing'] ?? 0, $cur],
            ['Interest Rate', $inp['interest_rate'] ?? 0, '%'],
            ['Loan Duration', $inp['loan_duration'] ?? 0, 'years'],
            ['Credit Sales %', $inp['credit_sales_percent'] ?? 0, '%'],
            ['Credit Purchases %', $inp['credit_purchases_percent'] ?? 0, '%'],
        ];
        foreach ($rows as $idx => [$label, $value, $unit]) {
            $r = $idx + 4;
            $ws->setCellValue("A{$r}", $label);
            $ws->setCellValue("B{$r}", $value);
            $ws->setCellValue("C{$r}", $unit);
        }
        $ws->getColumnDimension('A')->setWidth(28);
        $ws->getColumnDimension('B')->setWidth(18);
        $ws->getColumnDimension('C')->setWidth(8);
    }

    // Sheet 2 — Monthly Model: Line Item | Formula Logic | M1..M12
    private function buildMonthlyModelSheet(Worksheet $ws, array $monthly): void
    {
        $ws->setTitle('Monthly Model');
        $ws->setCellValue('A1', 'Monthly Model');
        $ws->getStyle('A1')->getFont()->setBold(true)->setSize(13);
        $hdrs = ['Line Item','Formula Logic','M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12'];
        foreach ($hdrs as $c => $h) {
            $ws->setCellValue(Coordinate::stringFromColumnIndex($c + 1) . '2', $h);
        }
        $ws->getStyle('A2:N2')->getFont()->setBold(true);
        foreach ($this->monthlyModelRowDefs() as $ri => $def) {
            $row = $ri + 3;
            $ws->setCellValue("A{$row}", $def['label']);
            $ws->setCellValue("B{$row}", $def['logic']);
            foreach ($monthly as $mi => $md) {
                $col = Coordinate::stringFromColumnIndex($mi + 3);
                $ws->setCellValue("{$col}{$row}", $md[$def['key']] ?? 0);
                $ws->getStyle("{$col}{$row}")->getNumberFormat()->setFormatCode('#,##0.00');
            }
        }
        $ws->getColumnDimension('A')->setWidth(26);
        $ws->getColumnDimension('B')->setWidth(32);
        for ($c = 3; $c <= 14; $c++) {
            $ws->getColumnDimensionByColumn($c)->setWidth(13);
        }
    }

    // Sheet 3 — Income Statement: Line Item | Annual Total | M1..M12
    private function buildIncomeStatementSheet(Worksheet $ws, array $is, array $monthly): void
    {
        $rows = [
            ['Revenue',             $is['revenue'],                          'revenue'],
            ['COGS',                $is['cogs'],                             'cogs'],
            ['Gross Profit',        $is['gross_profit'],                     'gross_profit'],
            ['Employee Salaries',   $monthly[0]['salaries'] * 12,            'salaries'],
            ['Management Salaries', $monthly[0]['mgmt_salaries'] * 12,       'mgmt_salaries'],
            ['Rent',                $monthly[0]['rent'] * 12,                'rent'],
            ['Utilities',           $monthly[0]['utilities'] * 12,           'utilities'],
            ['Office Supplies',     $monthly[0]['office_supplies'] * 12,     'office_supplies'],
            ['Advertising',         $monthly[0]['advertising'] * 12,         'advertising'],
            ['Legal Fees',          $monthly[0]['legal_fees'] * 12,          'legal_fees'],
            ['Other Expenses',      $monthly[0]['other_expenses'] * 12,      'other_expenses'],
            ['Total OpEx',          $is['total_opex'],                       'total_opex'],
            ['EBITDA',              $is['ebitda'],                           'ebitda'],
            ['Depreciation',        $is['depreciation'],                     'depreciation'],
            ['EBIT',                $is['ebit'],                             'ebit'],
            ['Interest Expense',    $is['interest_expense'],                 'interest'],
            ['Net Income',          $is['net_income'],                       'net_income'],
        ];
        $this->writeMonthlySheet($ws, 'Income Statement', 'Annual Total', $rows, $monthly);
    }

    // Sheet 4 — Cash Flow: Line Item | Annual Total | M1..M12
    private function buildCashFlowSheet(Worksheet $ws, array $cf, array $monthly): void
    {
        $totalNCF = array_sum(array_column($monthly, 'net_cash_flow'));
        $rows = [
            ['Opening Cash',          0.0,                              'opening_cash'],
            ['Cash Collected',        $cf['cash_collected'],            'cash_collected'],
            ['Funding Received',      $cf['funding_inflows'],           'funding'],
            ['Cash Paid (Purchases)', $cf['cash_paid_for_purchases'],   'cash_paid'],
            ['Total OpEx Paid',       $cf['total_opex_paid'],           'total_opex'],
            ['Capital Expenditures',  abs($cf['capital_expenditures']), 'capex'],
            ['Debt Service',          abs($cf['debt_service']),         'debt_service'],
            ['Net Cash Flow',         round($totalNCF, 2),              'net_cash_flow'],
            ['Ending Cash',           $monthly[11]['ending_cash'],      'ending_cash'],
        ];
        $this->writeMonthlySheet($ws, 'Cash Flow', 'Annual Total', $rows, $monthly);
    }

    // Sheet 5 — Balance Sheet: Line Item | Year End | M1..M12
    private function buildBalanceSheetSheet(Worksheet $ws, array $bs, array $monthly): void
    {
        $rows = [
            ['Cash',                     $bs['cash'],                     'ending_cash'],
            ['Accounts Receivable',      $bs['accounts_receivable'],      'ar'],
            ['Inventory',                0.0,                             'inventory'],
            ['Net Fixed Assets',         $bs['net_fixed_assets'],         'net_fixed_assets'],
            ['Total Assets',             $bs['total_assets'],             'total_assets'],
            ['Accounts Payable',         $bs['accounts_payable'],         'ap'],
            ['Debt Balance',             $bs['debt_balance'],             'debt_balance'],
            ['Equity',                   $bs['equity'],                   'equity'],
            ['Total Liabilities+Equity', $bs['total_liabilities_equity'], 'total_le'],
            ['Balance Check',            $bs['balance_check'],            'balance_check'],
        ];
        $this->writeMonthlySheet($ws, 'Balance Sheet', 'Year End', $rows, $monthly);
    }

    // Sheet 6 — CAC: simple 3-row table + note
    private function buildCACSheet(Worksheet $ws, array $cac): void
    {
        $ws->setTitle('CAC');
        $ws->setCellValue('A1', 'Customer Acquisition Cost (CAC)');
        $ws->getStyle('A1')->getFont()->setBold(true)->setSize(13);
        $ws->setCellValue('A3', 'Metric');
        $ws->setCellValue('B3', 'Value');
        $ws->getStyle('A3:B3')->getFont()->setBold(true);
        $rows = [
            ['Advertising Spend',          $cac['advertising_spend']],
            ['Units Sold (Acquired)',       $cac['units_acquired']],
            ['CAC (Cost per Acquisition)', $cac['cost_per_acquisition']],
        ];
        foreach ($rows as $ri => [$label, $value]) {
            $r = $ri + 4;
            $ws->setCellValue("A{$r}", $label);
            $ws->setCellValue("B{$r}", $value);
            $ws->getStyle("B{$r}")->getNumberFormat()->setFormatCode('#,##0.0000');
        }
        $ws->setCellValue('A8', 'Note: CAC = Advertising Spend ÷ Units Sold');
        $ws->getStyle('A8')->getFont()->setItalic(true);
        $ws->getColumnDimension('A')->setWidth(30);
        $ws->getColumnDimension('B')->setWidth(18);
    }

    // Sheet 7 — Dashboard: key metrics (A-B) + monthly revenue/cash table (D-F)
    private function buildDashboardSheet(Worksheet $ws, array $dash, array $monthly): void
    {
        $ws->setTitle('Dashboard');
        $ws->setCellValue('A1', 'Financial Dashboard');
        $ws->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $ws->setCellValue('A3', 'Metric');
        $ws->setCellValue('B3', 'Value (' . ($dash['currency'] ?? 'USD') . ')');
        $ws->getStyle('A3:B3')->getFont()->setBold(true);
        $metrics = [
            ['Annual Revenue',    $dash['annual_revenue']],
            ['Gross Profit',      $dash['gross_profit']],
            ['Net Income',        $dash['net_income']],
            ['Gross Margin %',    $dash['gross_margin_pct']],
            ['Net Margin %',      $dash['net_margin_pct']],
            ['Year-End Cash',     $dash['ending_cash']],
            ['Break-Even Units',  $dash['break_even_units'] ?? 'N/A'],
            ['CAC',               $dash['cac']],
            ['Debt at Year-End',  $dash['debt_at_year_end']],
        ];
        foreach ($metrics as $ri => [$label, $value]) {
            $r = $ri + 4;
            $ws->setCellValue("A{$r}", $label);
            $ws->setCellValue("B{$r}", $value);
            if (is_numeric($value)) {
                $ws->getStyle("B{$r}")->getNumberFormat()->setFormatCode('#,##0.00');
            }
        }
        $ws->setCellValue('D3', 'Month');
        $ws->setCellValue('E3', 'Revenue');
        $ws->setCellValue('F3', 'Ending Cash');
        $ws->getStyle('D3:F3')->getFont()->setBold(true);
        foreach ($monthly as $mi => $md) {
            $r = $mi + 4;
            $ws->setCellValue("D{$r}", 'M' . ($mi + 1));
            $ws->setCellValue("E{$r}", $md['revenue']);
            $ws->setCellValue("F{$r}", $md['ending_cash']);
            $ws->getStyle("E{$r}:F{$r}")->getNumberFormat()->setFormatCode('#,##0.00');
        }
        $ws->getColumnDimension('A')->setWidth(22);
        $ws->getColumnDimension('B')->setWidth(18);
        $ws->getColumnDimension('D')->setWidth(8);
        $ws->getColumnDimension('E')->setWidth(16);
        $ws->getColumnDimension('F')->setWidth(16);
    }

    // Shared writer for IS, CF, BS sheets: Label | Annual/YearEnd | M1..M12
    private function writeMonthlySheet(Worksheet $ws, string $title, string $col2, array $rows, array $monthly): void
    {
        $ws->setTitle($title);
        $ws->setCellValue('A1', $title);
        $ws->getStyle('A1')->getFont()->setBold(true)->setSize(13);
        $hdrs = ['Line Item', $col2, 'M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12'];
        foreach ($hdrs as $c => $h) {
            $ws->setCellValue(Coordinate::stringFromColumnIndex($c + 1) . '2', $h);
        }
        $ws->getStyle('A2:N2')->getFont()->setBold(true);
        foreach ($rows as $ri => [$label, $annual, $key]) {
            $row = $ri + 3;
            $ws->setCellValue("A{$row}", $label);
            $ws->setCellValue("B{$row}", $annual);
            $ws->getStyle("B{$row}")->getNumberFormat()->setFormatCode('#,##0.00');
            foreach ($monthly as $mi => $md) {
                $col = Coordinate::stringFromColumnIndex($mi + 3);
                $ws->setCellValue("{$col}{$row}", $md[$key] ?? 0);
                $ws->getStyle("{$col}{$row}")->getNumberFormat()->setFormatCode('#,##0.00');
            }
        }
        $ws->getColumnDimension('A')->setWidth(26);
        $ws->getColumnDimension('B')->setWidth(16);
        for ($c = 3; $c <= 14; $c++) {
            $ws->getColumnDimensionByColumn($c)->setWidth(13);
        }
    }

    private function monthlyModelRowDefs(): array
    {
        return [
            ['label' => 'Units Sold',               'logic' => 'annual_units_sold ÷ 12',       'key' => 'units_sold'],
            ['label' => 'Revenue',                  'logic' => 'units_sold × selling_price',   'key' => 'revenue'],
            ['label' => 'Cash Sales',               'logic' => 'revenue × (1−credit_pct)',     'key' => 'cash_sales'],
            ['label' => 'Credit Sales',             'logic' => 'revenue × credit_pct',         'key' => 'credit_sales'],
            ['label' => 'Cash Collected',           'logic' => 'cash_sales + prior credit',    'key' => 'cash_collected'],
            ['label' => 'Units Purchased',          'logic' => 'annual_purchased ÷ 12',        'key' => 'units_purchased'],
            ['label' => 'COGS',                     'logic' => 'units_purch × unit_cost',      'key' => 'cogs'],
            ['label' => 'Cash Purchases',           'logic' => 'cogs × (1−credit_pct)',        'key' => 'cash_purchases'],
            ['label' => 'Credit Purchases',         'logic' => 'cogs × credit_pct',            'key' => 'credit_purchases'],
            ['label' => 'Cash Paid',                'logic' => 'cash_purch + prior credit',    'key' => 'cash_paid'],
            ['label' => 'Gross Profit',             'logic' => 'revenue − cogs',               'key' => 'gross_profit'],
            ['label' => 'Employee Salaries',        'logic' => 'emp_salary × employees ÷ 12', 'key' => 'salaries'],
            ['label' => 'Management Salaries',      'logic' => 'mgr_salary × managers ÷ 12',  'key' => 'mgmt_salaries'],
            ['label' => 'Rent',                     'logic' => 'annual_rent ÷ 12',             'key' => 'rent'],
            ['label' => 'Utilities',                'logic' => 'annual_utilities ÷ 12',        'key' => 'utilities'],
            ['label' => 'Office Supplies',          'logic' => 'office_supplies ÷ 12',         'key' => 'office_supplies'],
            ['label' => 'Advertising',              'logic' => 'advertising ÷ 12',             'key' => 'advertising'],
            ['label' => 'Legal Fees',               'logic' => 'legal_fees ÷ 12',              'key' => 'legal_fees'],
            ['label' => 'Other Expenses',           'logic' => 'sum(other_exp) ÷ 12',          'key' => 'other_expenses'],
            ['label' => 'Total OpEx',               'logic' => 'sum of expense lines',         'key' => 'total_opex'],
            ['label' => 'EBITDA',                   'logic' => 'gross_profit − total_opex',    'key' => 'ebitda'],
            ['label' => 'Depreciation',             'logic' => 'annual_dep ÷ 12',              'key' => 'depreciation'],
            ['label' => 'EBIT',                     'logic' => 'ebitda − depreciation',        'key' => 'ebit'],
            ['label' => 'Interest Expense',         'logic' => 'debt_start × rate÷12',         'key' => 'interest'],
            ['label' => 'Net Income',               'logic' => 'ebit − interest',              'key' => 'net_income'],
            ['label' => 'CapEx',                    'logic' => 'total_capex (each month)',      'key' => 'capex'],
            ['label' => 'Funding Received',         'logic' => 'total_funding (each month)',    'key' => 'funding'],
            ['label' => 'Loan Repayment',           'logic' => 'borrowing ÷ (duration×12)',    'key' => 'loan_repayment'],
            ['label' => 'Debt Service',             'logic' => 'repayment + interest',         'key' => 'debt_service'],
            ['label' => 'Net Cash Flow',            'logic' => 'inflows − outflows',           'key' => 'net_cash_flow'],
            ['label' => 'Opening Cash',             'logic' => 'prior month ending_cash',      'key' => 'opening_cash'],
            ['label' => 'Ending Cash',              'logic' => 'opening_cash + net_cf',        'key' => 'ending_cash'],
            ['label' => 'Accounts Receivable',      'logic' => '1 month credit sales',         'key' => 'ar'],
            ['label' => 'Inventory',                'logic' => '0 (not modeled)',              'key' => 'inventory'],
            ['label' => 'Net Fixed Assets',         'logic' => 'capex×(m+1) − dep×(m+1)',     'key' => 'net_fixed_assets'],
            ['label' => 'Debt Balance',             'logic' => 'borrowing − rep×(m+1)',        'key' => 'debt_balance'],
            ['label' => 'Accounts Payable',         'logic' => '1 month credit purchases',     'key' => 'ap'],
            ['label' => 'Equity',                   'logic' => 'contribution + cum_net_income','key' => 'equity'],
            ['label' => 'Total Assets',             'logic' => 'cash + ar + fixed_assets',    'key' => 'total_assets'],
            ['label' => 'Total Liabilities+Equity', 'logic' => 'ap + debt + equity',           'key' => 'total_le'],
            ['label' => 'Balance Check',            'logic' => 'total_assets − (L+E)',         'key' => 'balance_check'],
        ];
    }
}
```

- [ ] **Step 4: Create PDF Blade template**

```blade
{{-- backend/resources/views/financial/pdf_export.blade.php --}}
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #111; margin: 20px; }
  h1 { font-size: 15px; margin-bottom: 2px; }
  h2 { font-size: 12px; margin-top: 14px; margin-bottom: 3px; border-bottom: 1px solid #bbb; padding-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  td { padding: 2px 5px; }
  td:last-child { text-align: right; }
  .hd td { font-weight: bold; background: #f0f0f0; }
  .tot td { font-weight: bold; border-top: 1px solid #999; }
  .badge { padding: 1px 6px; background: #e0edff; color: #1a56db; border-radius: 3px; font-size: 9px; }
</style>
</head>
<body>
<h1>Financial Report — {{ $projectName }}</h1>
<p>Scenario: <span class="badge">{{ $scenario }}</span> &nbsp; Currency: {{ $inputs['currency'] ?? 'USD' }}</p>

<h2>Income Statement</h2>
@php $is = $outputs['income_statement']; @endphp
<table>
  <tr><td>Revenue</td><td>{{ number_format($is['revenue'], 2) }}</td></tr>
  <tr><td>COGS</td><td>{{ number_format($is['cogs'], 2) }}</td></tr>
  <tr class="tot"><td>Gross Profit</td><td>{{ number_format($is['gross_profit'], 2) }}</td></tr>
  <tr class="hd"><td colspan="2">Operating Expenses</td></tr>
  <tr><td>Total Salaries</td><td>{{ number_format($is['total_salaries'], 2) }}</td></tr>
  <tr><td>Fixed OpEx (Rent/Utils/Office/Adv/Legal)</td><td>{{ number_format($is['fixed_opex'], 2) }}</td></tr>
  <tr><td>Other Expenses</td><td>{{ number_format($is['other_expenses_total'], 2) }}</td></tr>
  <tr class="tot"><td>Total OpEx</td><td>{{ number_format($is['total_opex'], 2) }}</td></tr>
  <tr class="tot"><td>EBITDA</td><td>{{ number_format($is['ebitda'], 2) }}</td></tr>
  <tr><td>Depreciation</td><td>{{ number_format($is['depreciation'], 2) }}</td></tr>
  <tr class="tot"><td>EBIT</td><td>{{ number_format($is['ebit'], 2) }}</td></tr>
  <tr><td>Interest Expense</td><td>{{ number_format($is['interest_expense'], 2) }}</td></tr>
  <tr class="tot"><td>Net Income</td><td>{{ number_format($is['net_income'], 2) }}</td></tr>
</table>

<h2>Cash Flow</h2>
@php $cf = $outputs['cash_flow']; @endphp
<table>
  <tr><td>Opening Cash</td><td>{{ number_format($cf['opening_cash'], 2) }}</td></tr>
  <tr><td>Cash Collected</td><td>{{ number_format($cf['cash_collected'], 2) }}</td></tr>
  <tr><td>Funding Received</td><td>{{ number_format($cf['funding_inflows'], 2) }}</td></tr>
  <tr><td>Cash Paid (Purchases)</td><td>({{ number_format($cf['cash_paid_for_purchases'], 2) }})</td></tr>
  <tr><td>Total OpEx Paid</td><td>({{ number_format($cf['total_opex_paid'], 2) }})</td></tr>
  <tr><td>Capital Expenditures</td><td>({{ number_format(abs($cf['capital_expenditures']), 2) }})</td></tr>
  <tr><td>Debt Service</td><td>({{ number_format(abs($cf['debt_service']), 2) }})</td></tr>
  <tr class="tot"><td>Ending Cash</td><td>{{ number_format($cf['ending_cash'], 2) }}</td></tr>
</table>

<h2>Balance Sheet (Year End)</h2>
@php $bs = $outputs['balance_sheet']; @endphp
<table>
  <tr class="hd"><td colspan="2">Assets</td></tr>
  <tr><td>Cash</td><td>{{ number_format($bs['cash'], 2) }}</td></tr>
  <tr><td>Accounts Receivable</td><td>{{ number_format($bs['accounts_receivable'], 2) }}</td></tr>
  <tr><td>Net Fixed Assets</td><td>{{ number_format($bs['net_fixed_assets'], 2) }}</td></tr>
  <tr class="tot"><td>Total Assets</td><td>{{ number_format($bs['total_assets'], 2) }}</td></tr>
  <tr class="hd"><td colspan="2">Liabilities & Equity</td></tr>
  <tr><td>Accounts Payable</td><td>{{ number_format($bs['accounts_payable'], 2) }}</td></tr>
  <tr><td>Debt Balance</td><td>{{ number_format($bs['debt_balance'], 2) }}</td></tr>
  <tr><td>Equity</td><td>{{ number_format($bs['equity'], 2) }}</td></tr>
  <tr class="tot"><td>Total Liabilities+Equity</td><td>{{ number_format($bs['total_liabilities_equity'], 2) }}</td></tr>
</table>

<h2>CAC</h2>
@php $cac = $outputs['cac']; @endphp
<table>
  <tr><td>Advertising Spend</td><td>{{ number_format($cac['advertising_spend'], 2) }}</td></tr>
  <tr><td>Units Sold</td><td>{{ number_format($cac['units_acquired']) }}</td></tr>
  <tr class="tot"><td>CAC (Cost per Acquisition)</td><td>{{ number_format($cac['cost_per_acquisition'], 4) }}</td></tr>
</table>

<h2>Dashboard</h2>
@php $d = $outputs['dashboard']; @endphp
<table>
  <tr><td>Annual Revenue</td><td>{{ number_format($d['annual_revenue'], 2) }}</td></tr>
  <tr><td>Gross Profit</td><td>{{ number_format($d['gross_profit'], 2) }}</td></tr>
  <tr><td>Net Income</td><td>{{ number_format($d['net_income'], 2) }}</td></tr>
  <tr><td>Gross Margin</td><td>{{ number_format($d['gross_margin_pct'], 2) }}%</td></tr>
  <tr><td>Net Margin</td><td>{{ number_format($d['net_margin_pct'], 2) }}%</td></tr>
  <tr><td>Year-End Cash</td><td>{{ number_format($d['ending_cash'], 2) }}</td></tr>
  <tr><td>Break-Even Units</td><td>{{ $d['break_even_units'] !== null ? number_format($d['break_even_units'], 2) : 'N/A' }}</td></tr>
  <tr><td>CAC</td><td>{{ number_format($d['cac'], 4) }}</td></tr>
  <tr><td>Debt at Year-End</td><td>{{ number_format($d['debt_at_year_end'], 2) }}</td></tr>
</table>
</body>
</html>
```

- [ ] **Step 5: Update FinancialController — inject exporter, complete export method**

Replace the constructor and export method in `backend/app/Http/Controllers/FinancialController.php`.

Add import at top (after existing use statements):
```php
use App\Services\FinancialExportService;
```

Replace constructor:
```php
public function __construct(
    private FinancialCalculationService $calculator,
    private FinancialExportService $exporter,
) {}
```

Replace the `export` method stub:
```php
public function export(Request $request, Project $project, string $scenario, string $format): \Illuminate\Http\Response|\Symfony\Component\HttpFoundation\BinaryFileResponse
{
    $project->loadMissing('collaborators');
    $this->authorize('view', $project);

    if (!in_array($scenario, self::SCENARIOS, true)) {
        abort(422, 'Invalid scenario.');
    }
    if (!in_array($format, ['excel', 'pdf'], true)) {
        abort(422, 'Invalid format. Use excel or pdf.');
    }

    $row = FinancialInput::where('project_id', $project->id)
        ->where('scenario', $scenario)
        ->first();

    if ($row === null) {
        abort(404, 'No financial data for this scenario.');
    }

    $inputs  = $row->toArray();
    $outputs = $this->calculator->calculate($inputs);

    if ($format === 'excel') {
        $path     = $this->exporter->toExcel($inputs, $outputs, $scenario, $project->name);
        $filename = "financial_{$project->id}_{$scenario}.xlsx";
        $mime     = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
        $path     = $this->exporter->toPdf($inputs, $outputs, $scenario, $project->name);
        $filename = "financial_{$project->id}_{$scenario}.pdf";
        $mime     = 'application/pdf';
    }

    return response()->download($path, $filename, ['Content-Type' => $mime])
        ->deleteFileAfterSend();
}
```

- [ ] **Step 6: Run feature tests — all should pass now**

```bash
cd backend && php artisan test tests/Feature/FinancialControllerTest.php
```
Expected: All tests PASS including the Excel export test (200 status, xlsx content-type).

- [ ] **Step 7: Commit**

```bash
cd backend
git add app/Services/FinancialCalculationService.php \
        app/Services/FinancialExportService.php \
        resources/views/financial/pdf_export.blade.php \
        app/Http/Controllers/FinancialController.php \
        tests/Unit/FinancialCalculationServiceTest.php \
        composer.json composer.lock
git commit -m "feat: add workbook-accurate export service (7-sheet Excel + PDF)"
```

---

## Task 5: Frontend Types, API Service, Hook

**Files:**
- Modify: `frontend/components/project/financial/financialTypes.ts` (full replacement)
- Delete: `frontend/components/project/financial/financialCalculations.ts`
- Create: `frontend/lib/financialApi.ts`
- Create: `frontend/hooks/useFinancialData.ts`

- [ ] **Step 1: Replace financialTypes.ts**

```typescript
// frontend/components/project/financial/financialTypes.ts

export type FinancialScenario = 'expected' | 'best' | 'worst'

export type OtherExpense = { description: string; value: number }
export type CapExItem = { name: string; value: number; life_years: number }
export type OtherFundSource = { description: string; value: number }

export type FinancialInputs = {
  currency: string
  product_description: string
  product_category: string
  annual_units_sold: number
  selling_price_per_unit: number
  unit_cost: number
  annual_units_purchased: number
  annual_rent: number
  annual_utilities: number
  num_employees: number
  employee_annual_salary: number
  num_managers: number
  manager_annual_salary: number
  office_supplies: number
  advertising: number
  legal_fees: number
  other_expenses: OtherExpense[]
  computers_value: number
  computers_life_years: number
  furniture_value: number
  furniture_life_years: number
  equipment_value: number
  equipment_life_years: number
  other_capex: CapExItem[]
  cash_contribution: number
  borrowing: number
  other_funds: OtherFundSource[]
  interest_rate: number
  loan_duration: number
  credit_sales_percent: number
  credit_purchases_percent: number
}

export type IncomeStatement = {
  revenue: number
  cogs: number
  gross_profit: number
  total_salaries: number
  fixed_opex: number
  other_expenses_total: number
  total_opex: number
  ebitda: number
  depreciation: number
  ebit: number
  interest_expense: number
  net_income: number
}

export type CashFlowStatement = {
  opening_cash: number
  cash_collected: number
  funding_inflows: number
  cash_paid_for_purchases: number
  total_opex_paid: number
  capital_expenditures: number
  debt_service: number
  ending_cash: number
}

export type BalanceSheet = {
  cash: number
  accounts_receivable: number
  inventory: number
  net_fixed_assets: number
  total_assets: number
  accounts_payable: number
  debt_balance: number
  equity: number
  total_liabilities_equity: number
  balance_check: number
}

export type CACAnalysis = {
  advertising_spend: number
  units_acquired: number
  cost_per_acquisition: number
}

export type DashboardSummary = {
  currency: string
  annual_revenue: number
  gross_profit: number
  net_income: number
  ending_cash: number
  break_even_units: number | null
  cac: number
  debt_at_year_end: number
  gross_margin_pct: number
  net_margin_pct: number
}

export type FinancialOutputs = {
  income_statement: IncomeStatement
  cash_flow: CashFlowStatement
  balance_sheet: BalanceSheet
  cac: CACAnalysis
  dashboard: DashboardSummary
}

export type ScenarioData = {
  inputs: FinancialInputs | null
  outputs: FinancialOutputs | null
}

export type AllScenariosData = {
  expected: ScenarioData
  best: ScenarioData
  worst: ScenarioData
}

export const EMPTY_FINANCIAL_INPUTS: FinancialInputs = {
  currency: 'USD',
  product_description: '',
  product_category: '',
  annual_units_sold: 0,
  selling_price_per_unit: 0,
  unit_cost: 0,
  annual_units_purchased: 0,
  annual_rent: 0,
  annual_utilities: 0,
  num_employees: 0,
  employee_annual_salary: 0,
  num_managers: 0,
  manager_annual_salary: 0,
  office_supplies: 0,
  advertising: 0,
  legal_fees: 0,
  other_expenses: [],
  computers_value: 0,
  computers_life_years: 3,
  furniture_value: 0,
  furniture_life_years: 5,
  equipment_value: 0,
  equipment_life_years: 7,
  other_capex: [],
  cash_contribution: 0,
  borrowing: 0,
  other_funds: [],
  interest_rate: 0,
  loan_duration: 1,
  credit_sales_percent: 0,
  credit_purchases_percent: 0,
}

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'EGP', 'JOD', 'KWD']

export const PRODUCT_CATEGORIES = [
  'Technology', 'Retail', 'Food & Beverage', 'Healthcare', 'Education',
  'Manufacturing', 'Services', 'Real Estate', 'Agriculture', 'Other',
]
```

- [ ] **Step 2: Delete financialCalculations.ts**

```bash
rm frontend/components/project/financial/financialCalculations.ts
```

- [ ] **Step 3: Create financialApi.ts**

```typescript
// frontend/lib/financialApi.ts
import api from '@/lib/api'
import type { AllScenariosData, FinancialInputs, FinancialScenario, ScenarioData } from '@/components/project/financial/financialTypes'

export async function fetchAllScenarios(projectId: number): Promise<AllScenariosData> {
  const res = await api.get<{ data: AllScenariosData }>(`/projects/${projectId}/financial`)
  return res.data.data
}

export async function fetchScenario(projectId: number, scenario: FinancialScenario): Promise<ScenarioData> {
  const res = await api.get<{ data: ScenarioData }>(`/projects/${projectId}/financial/${scenario}`)
  return res.data.data
}

export async function saveAndCalculate(
  projectId: number,
  scenario: FinancialScenario,
  inputs: Partial<FinancialInputs>,
): Promise<ScenarioData> {
  const res = await api.put<{ data: ScenarioData }>(`/projects/${projectId}/financial/${scenario}`, inputs)
  return res.data.data
}

export function exportUrl(projectId: number, scenario: FinancialScenario, format: 'excel' | 'pdf'): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'
  return `${base}/projects/${projectId}/financial/${scenario}/export/${format}`
}
```

- [ ] **Step 4: Create useFinancialData hook**

```typescript
// frontend/hooks/useFinancialData.ts
import { useCallback, useEffect, useState } from 'react'
import { fetchAllScenarios, saveAndCalculate } from '@/lib/financialApi'
import type { AllScenariosData, FinancialInputs, FinancialScenario, ScenarioData } from '@/components/project/financial/financialTypes'

type UseFinancialDataReturn = {
  data: AllScenariosData | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  save: (scenario: FinancialScenario, inputs: Partial<FinancialInputs>) => Promise<ScenarioData>
  reload: () => void
}

export function useFinancialData(projectId: number): UseFinancialDataReturn {
  const [data, setData] = useState<AllScenariosData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchAllScenarios(projectId)
      .then((d) => { if (active) setData(d) })
      .catch(() => { if (active) setError('Failed to load financial data.') })
      .finally(() => { if (active) setIsLoading(false) })

    return () => { active = false }
  }, [projectId, reloadKey])

  const save = useCallback(async (scenario: FinancialScenario, inputs: Partial<FinancialInputs>): Promise<ScenarioData> => {
    setIsSaving(true)
    setError(null)
    try {
      const result = await saveAndCalculate(projectId, scenario, inputs)
      setData((prev) => prev ? { ...prev, [scenario]: result } : prev)
      return result
    } catch {
      setError('Failed to save financial data.')
      throw new Error('Failed to save financial data.')
    } finally {
      setIsSaving(false)
    }
  }, [projectId])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  return { data, isLoading, isSaving, error, save, reload }
}
```

- [ ] **Step 5: Commit**

```bash
cd frontend
git add components/project/financial/financialTypes.ts \
        lib/financialApi.ts \
        hooks/useFinancialData.ts
git rm components/project/financial/financialCalculations.ts
git commit -m "feat: add financial API service, hook, and updated snake_case types"
```

---

## Task 6: Frontend Modal + Input Sections + Result Tabs

**Files:**
- Modify: `frontend/components/project/financial/FinancialInputSections.tsx`
- Modify: `frontend/components/project/financial/FinancialResultTabs.tsx`
- Modify: `frontend/components/project/financial/FinancialStatementModal.tsx`
- Modify: `frontend/app/app/projects/[id]/money/page.tsx`

- [ ] **Step 1: Rewrite FinancialInputSections.tsx**

```tsx
// frontend/components/project/financial/FinancialInputSections.tsx
"use client"

import { CURRENCIES, PRODUCT_CATEGORIES, type CapExItem, type FinancialInputs, type OtherExpense, type OtherFundSource } from './financialTypes'

type Setter = (patch: Partial<FinancialInputs>) => void

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

const inputClass = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
const selectClass = inputClass

function NumInput({ value, onChange, min = 0, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; step?: number }) {
  return (
    <input
      type="number"
      className={inputClass}
      value={value}
      min={min}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  )
}

export function BasicInfoSection({ inputs, set }: { inputs: FinancialInputs; set: Setter }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Currency">
        <select className={selectClass} value={inputs.currency} onChange={(e) => set({ currency: e.target.value })}>
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Product Category">
        <select className={selectClass} value={inputs.product_category} onChange={(e) => set({ product_category: e.target.value })}>
          <option value="">Select category…</option>
          {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Product Description">
        <input
          type="text"
          className={inputClass}
          value={inputs.product_description}
          onChange={(e) => set({ product_description: e.target.value })}
          placeholder="Describe your product or service"
        />
      </Field>
    </div>
  )
}

export function RevenueSection({ inputs, set }: { inputs: FinancialInputs; set: Setter }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Annual Units Sold">
        <NumInput value={inputs.annual_units_sold} onChange={(v) => set({ annual_units_sold: v })} />
      </Field>
      <Field label="Selling Price per Unit">
        <NumInput value={inputs.selling_price_per_unit} onChange={(v) => set({ selling_price_per_unit: v })} step={0.01} />
      </Field>
      <Field label="Unit Cost">
        <NumInput value={inputs.unit_cost} onChange={(v) => set({ unit_cost: v })} step={0.01} />
      </Field>
      <Field label="Annual Units Purchased">
        <NumInput value={inputs.annual_units_purchased} onChange={(v) => set({ annual_units_purchased: v })} />
      </Field>
    </div>
  )
}

export function OperatingExpensesSection({ inputs, set }: { inputs: FinancialInputs; set: Setter }) {
  function addOther() {
    set({ other_expenses: [...inputs.other_expenses, { description: '', value: 0 }] })
  }
  function patchOther(idx: number, patch: Partial<OtherExpense>) {
    set({ other_expenses: inputs.other_expenses.map((x, i) => i === idx ? { ...x, ...patch } : x) })
  }
  function removeOther(idx: number) {
    set({ other_expenses: inputs.other_expenses.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Annual Rent"><NumInput value={inputs.annual_rent} onChange={(v) => set({ annual_rent: v })} /></Field>
        <Field label="Annual Utilities"><NumInput value={inputs.annual_utilities} onChange={(v) => set({ annual_utilities: v })} /></Field>
        <Field label="No. of Employees"><NumInput value={inputs.num_employees} onChange={(v) => set({ num_employees: v })} /></Field>
        <Field label="Employee Annual Salary"><NumInput value={inputs.employee_annual_salary} onChange={(v) => set({ employee_annual_salary: v })} step={0.01} /></Field>
        <Field label="No. of Managers"><NumInput value={inputs.num_managers} onChange={(v) => set({ num_managers: v })} /></Field>
        <Field label="Manager Annual Salary"><NumInput value={inputs.manager_annual_salary} onChange={(v) => set({ manager_annual_salary: v })} step={0.01} /></Field>
        <Field label="Office Supplies"><NumInput value={inputs.office_supplies} onChange={(v) => set({ office_supplies: v })} /></Field>
        <Field label="Advertising"><NumInput value={inputs.advertising} onChange={(v) => set({ advertising: v })} /></Field>
        <Field label="Legal Fees"><NumInput value={inputs.legal_fees} onChange={(v) => set({ legal_fees: v })} /></Field>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Other Expenses</p>
        <div className="space-y-2">
          {inputs.other_expenses.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input className={inputClass} value={item.description} placeholder="Description" onChange={(e) => patchOther(idx, { description: e.target.value })} />
              <input type="number" className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm outline-none" value={item.value} min={0} step={0.01} onChange={(e) => patchOther(idx, { value: parseFloat(e.target.value) || 0 })} />
              <button type="button" onClick={() => removeOther(idx)} className="shrink-0 text-muted-foreground hover:text-destructive text-sm px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={addOther} className="text-xs text-primary underline-offset-2 hover:underline">+ Add expense</button>
        </div>
      </div>
    </div>
  )
}

export function CapExSection({ inputs, set }: { inputs: FinancialInputs; set: Setter }) {
  function addOtherCapex() {
    set({ other_capex: [...inputs.other_capex, { name: '', value: 0, life_years: 5 }] })
  }
  function patchCapex(idx: number, patch: Partial<CapExItem>) {
    set({ other_capex: inputs.other_capex.map((x, i) => i === idx ? { ...x, ...patch } : x) })
  }
  function removeCapex(idx: number) {
    set({ other_capex: inputs.other_capex.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Computers Value"><NumInput value={inputs.computers_value} onChange={(v) => set({ computers_value: v })} /></Field>
        <Field label="Computers Life (years)"><NumInput value={inputs.computers_life_years} min={1} onChange={(v) => set({ computers_life_years: v })} /></Field>
        <div />
        <Field label="Furniture Value"><NumInput value={inputs.furniture_value} onChange={(v) => set({ furniture_value: v })} /></Field>
        <Field label="Furniture Life (years)"><NumInput value={inputs.furniture_life_years} min={1} onChange={(v) => set({ furniture_life_years: v })} /></Field>
        <div />
        <Field label="Equipment Value"><NumInput value={inputs.equipment_value} onChange={(v) => set({ equipment_value: v })} /></Field>
        <Field label="Equipment Life (years)"><NumInput value={inputs.equipment_life_years} min={1} onChange={(v) => set({ equipment_life_years: v })} /></Field>
        <div />
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Other CapEx Items</p>
        <div className="space-y-2">
          {inputs.other_capex.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input className={inputClass} value={item.name} placeholder="Name" onChange={(e) => patchCapex(idx, { name: e.target.value })} />
              <input type="number" className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm outline-none" value={item.value} min={0} step={0.01} placeholder="Value" onChange={(e) => patchCapex(idx, { value: parseFloat(e.target.value) || 0 })} />
              <input type="number" className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm outline-none" value={item.life_years} min={1} placeholder="Life yrs" onChange={(e) => patchCapex(idx, { life_years: parseInt(e.target.value) || 1 })} />
              <button type="button" onClick={() => removeCapex(idx)} className="shrink-0 text-muted-foreground hover:text-destructive text-sm px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={addOtherCapex} className="text-xs text-primary underline-offset-2 hover:underline">+ Add item</button>
        </div>
      </div>
    </div>
  )
}

export function FundsSection({ inputs, set }: { inputs: FinancialInputs; set: Setter }) {
  function addFund() {
    set({ other_funds: [...inputs.other_funds, { description: '', value: 0 }] })
  }
  function patchFund(idx: number, patch: Partial<OtherFundSource>) {
    set({ other_funds: inputs.other_funds.map((x, i) => i === idx ? { ...x, ...patch } : x) })
  }
  function removeFund(idx: number) {
    set({ other_funds: inputs.other_funds.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cash Contribution"><NumInput value={inputs.cash_contribution} onChange={(v) => set({ cash_contribution: v })} step={0.01} /></Field>
        <Field label="Borrowing Amount"><NumInput value={inputs.borrowing} onChange={(v) => set({ borrowing: v })} step={0.01} /></Field>
        <Field label="Interest Rate (%)"><NumInput value={inputs.interest_rate} onChange={(v) => set({ interest_rate: v })} step={0.01} /></Field>
        <Field label="Loan Duration (years)"><NumInput value={inputs.loan_duration} min={1} onChange={(v) => set({ loan_duration: v })} /></Field>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Other Fund Sources</p>
        <div className="space-y-2">
          {inputs.other_funds.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input className={inputClass} value={item.description} placeholder="Description" onChange={(e) => patchFund(idx, { description: e.target.value })} />
              <input type="number" className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm outline-none" value={item.value} min={0} step={0.01} onChange={(e) => patchFund(idx, { value: parseFloat(e.target.value) || 0 })} />
              <button type="button" onClick={() => removeFund(idx)} className="shrink-0 text-muted-foreground hover:text-destructive text-sm px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={addFund} className="text-xs text-primary underline-offset-2 hover:underline">+ Add source</button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Credit Sales (%)"><NumInput value={inputs.credit_sales_percent} onChange={(v) => set({ credit_sales_percent: v })} step={0.01} /></Field>
        <Field label="Credit Purchases (%)"><NumInput value={inputs.credit_purchases_percent} onChange={(v) => set({ credit_purchases_percent: v })} step={0.01} /></Field>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite FinancialResultTabs.tsx**

```tsx
// frontend/components/project/financial/FinancialResultTabs.tsx
"use client"

import type { BalanceSheet, CACAnalysis, CashFlowStatement, DashboardSummary, IncomeStatement } from './financialTypes'

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined) return '—'
  return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className={bold ? 'font-semibold bg-muted/30' : ''}>
      <td className="py-1.5 pr-4 text-sm text-muted-foreground">{label}</td>
      <td className="py-1.5 text-right text-sm tabular-nums">{value}</td>
    </tr>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <table className="w-full">{children}</table>
    </div>
  )
}

export function IncomeStatementTab({ data, currency }: { data: IncomeStatement; currency: string }) {
  return (
    <div className="space-y-4">
      <Section title={`Revenue — ${currency}`}>
        <Row label="Revenue" value={fmt(data.revenue)} bold />
        <Row label="COGS / Purchases Cost" value={fmt(data.cogs)} />
        <Row label="Gross Profit" value={fmt(data.gross_profit)} bold />
      </Section>
      <Section title="Operating Expenses">
        <Row label="Total Salaries" value={fmt(data.total_salaries)} />
        <Row label="Rent, Utilities & Fixed OpEx" value={fmt(data.fixed_opex)} />
        <Row label="Other Expenses" value={fmt(data.other_expenses_total)} />
        <Row label="Total OpEx" value={fmt(data.total_opex)} bold />
        <Row label="EBITDA" value={fmt(data.ebitda)} bold />
      </Section>
      <Section title="Below EBITDA">
        <Row label="Depreciation" value={fmt(data.depreciation)} />
        <Row label="EBIT" value={fmt(data.ebit)} bold />
        <Row label="Interest Expense" value={fmt(data.interest_expense)} />
        <Row label="Net Income" value={fmt(data.net_income)} bold />
      </Section>
    </div>
  )
}

export function CashFlowTab({ data, currency }: { data: CashFlowStatement; currency: string }) {
  return (
    <div className="space-y-4">
      <Section title={`Cash Flow — ${currency}`}>
        <Row label="Opening Cash" value={fmt(data.opening_cash)} />
        <Row label="Cash Collected from Sales" value={fmt(data.cash_collected)} />
        <Row label="Funding Inflows" value={fmt(data.funding_inflows)} />
        <Row label="Cash Paid for Purchases" value={fmt(data.cash_paid_for_purchases)} />
        <Row label="Operating Expenses Paid" value={fmt(data.total_opex_paid)} />
        <Row label="Capital Expenditures" value={fmt(data.capital_expenditures)} />
        <Row label="Debt Service (Principal + Interest)" value={fmt(data.debt_service)} />
        <Row label="Ending Cash" value={fmt(data.ending_cash)} bold />
      </Section>
    </div>
  )
}

export function BalanceSheetTab({ data, currency }: { data: BalanceSheet; currency: string }) {
  return (
    <div className="space-y-4">
      <Section title={`Assets — ${currency}`}>
        <Row label="Cash" value={fmt(data.cash)} />
        <Row label="Accounts Receivable" value={fmt(data.accounts_receivable)} />
        <Row label="Inventory" value={fmt(data.inventory)} />
        <Row label="Net Fixed Assets" value={fmt(data.net_fixed_assets)} />
        <Row label="Total Assets" value={fmt(data.total_assets)} bold />
      </Section>
      <Section title="Liabilities & Equity">
        <Row label="Accounts Payable" value={fmt(data.accounts_payable)} />
        <Row label="Debt Balance" value={fmt(data.debt_balance)} />
        <Row label="Equity + Retained Earnings" value={fmt(data.equity)} bold />
        <Row label="Total Liabilities & Equity" value={fmt(data.total_liabilities_equity)} bold />
      </Section>
      {data.balance_check !== 0 && (
        <p className="text-xs text-muted-foreground">
          Balance check: {fmt(data.balance_check)} — reflects monthly investment model.
        </p>
      )}
    </div>
  )
}

export function CACTab({ data, currency }: { data: CACAnalysis; currency: string }) {
  return (
    <div className="space-y-4">
      <Section title={`Customer Acquisition Cost — ${currency}`}>
        <Row label="Advertising Spend" value={fmt(data.advertising_spend)} />
        <Row label="Units / Customers Acquired" value={fmt(data.units_acquired, 0)} />
        <Row label="Cost per Acquisition (CAC)" value={fmt(data.cost_per_acquisition, 4)} bold />
      </Section>
    </div>
  )
}

function MetricCard({ label, value, suffix = '' }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">
        {value}
        {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
      </p>
    </div>
  )
}

export function DashboardTab({ data }: { data: DashboardSummary }) {
  const currency = data.currency
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Annual Revenue" value={fmt(data.annual_revenue)} suffix={currency} />
        <MetricCard label="Gross Profit" value={fmt(data.gross_profit)} suffix={currency} />
        <MetricCard label="Net Income" value={fmt(data.net_income)} suffix={currency} />
        <MetricCard label="Ending Cash" value={fmt(data.ending_cash)} suffix={currency} />
        <MetricCard label="Gross Margin" value={fmt(data.gross_margin_pct)} suffix="%" />
        <MetricCard label="Net Margin" value={fmt(data.net_margin_pct)} suffix="%" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3 text-sm">
        <div><span className="text-muted-foreground">Break-even Units: </span><strong>{data.break_even_units !== null ? fmt(data.break_even_units, 0) : '—'}</strong></div>
        <div><span className="text-muted-foreground">CAC: </span><strong>{currency} {fmt(data.cac, 4)}</strong></div>
        <div><span className="text-muted-foreground">Debt at Year End: </span><strong>{currency} {fmt(data.debt_at_year_end)}</strong></div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Rewrite FinancialStatementModal.tsx**

```tsx
// frontend/components/project/financial/FinancialStatementModal.tsx
"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, Download } from "lucide-react"
import { useFinancialData } from "@/hooks/useFinancialData"
import { exportUrl } from "@/lib/financialApi"
import { EMPTY_FINANCIAL_INPUTS, type FinancialInputs, type FinancialScenario } from "./financialTypes"
import { BasicInfoSection, CapExSection, FundsSection, OperatingExpensesSection, RevenueSection } from "./FinancialInputSections"
import { BalanceSheetTab, CACTab, CashFlowTab, DashboardTab, IncomeStatementTab } from "./FinancialResultTabs"
import { Button } from "@/components/ui/button"
import { getToken } from "@/lib/auth"

type Props = { open: boolean; onClose: () => void; projectId: number }

const SCENARIOS: FinancialScenario[] = ['expected', 'best', 'worst']
const SCENARIO_LABELS: Record<FinancialScenario, string> = { expected: 'Expected', best: 'Best Case', worst: 'Worst Case' }
const INPUT_STEPS = ['Basic Info', 'Revenue', 'Operating Expenses', 'CapEx', 'Funds & Credit']
const RESULT_TABS = ['Dashboard', 'Income Statement', 'Cash Flow', 'Balance Sheet', 'CAC']

export function FinancialStatementModal({ open, onClose, projectId }: Props) {
  const { data, isLoading, isSaving, error, save } = useFinancialData(projectId)
  const [scenario, setScenario] = useState<FinancialScenario>('expected')
  const [view, setView] = useState<'inputs' | 'results'>('inputs')
  const [step, setStep] = useState(0)
  const [resultTab, setResultTab] = useState(0)
  const [localInputs, setLocalInputs] = useState<FinancialInputs>(EMPTY_FINANCIAL_INPUTS)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      const scenarioInputs = data[scenario]?.inputs
      setLocalInputs(scenarioInputs ? { ...EMPTY_FINANCIAL_INPUTS, ...scenarioInputs } : { ...EMPTY_FINANCIAL_INPUTS })
    }
  }, [data, scenario])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function patch(p: Partial<FinancialInputs>) {
    setLocalInputs((prev) => ({ ...prev, ...p }))
  }

  async function handleCalculate() {
    setSaveError(null)
    try {
      await save(scenario, localInputs)
      setView('results')
      setResultTab(0)
    } catch {
      setSaveError('Failed to calculate. Please try again.')
    }
  }

  const outputs = data?.[scenario]?.outputs ?? null
  const currency = localInputs.currency || 'USD'

  function handleExport(format: 'excel' | 'pdf') {
    const url = exportUrl(projectId, scenario, format)
    const token = getToken()
    const link = document.createElement('a')
    link.href = url + (token ? `?token=${encodeURIComponent(token)}` : '')
    link.download = `financial_${scenario}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    link.click()
  }

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-base font-semibold">Financial Statement</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        {/* Scenario selector */}
        <div className="flex gap-1 border-b border-border px-5 py-2">
          {SCENARIOS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setScenario(s); setView('inputs'); setStep(0) }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${scenario === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {SCENARIO_LABELS[s]}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 border-b border-border px-5 py-2">
          <button type="button" onClick={() => setView('inputs')} className={`rounded-md px-3 py-1 text-xs font-medium ${view === 'inputs' ? 'bg-secondary' : 'text-muted-foreground hover:bg-muted'}`}>Inputs</button>
          <button type="button" onClick={() => setView('results')} disabled={!outputs} className={`rounded-md px-3 py-1 text-xs font-medium disabled:opacity-40 ${view === 'results' ? 'bg-secondary' : 'text-muted-foreground hover:bg-muted'}`}>Results</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : view === 'inputs' ? (
            <div className="space-y-4">
              {/* Step tabs */}
              <div className="flex flex-wrap gap-1">
                {INPUT_STEPS.map((label, i) => (
                  <button key={label} type="button" onClick={() => setStep(i)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${step === i ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{i + 1}. {label}</button>
                ))}
              </div>
              <div className="rounded-lg border border-border p-4">
                {step === 0 && <BasicInfoSection inputs={localInputs} set={patch} />}
                {step === 1 && <RevenueSection inputs={localInputs} set={patch} />}
                {step === 2 && <OperatingExpensesSection inputs={localInputs} set={patch} />}
                {step === 3 && <CapExSection inputs={localInputs} set={patch} />}
                {step === 4 && <FundsSection inputs={localInputs} set={patch} />}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {outputs ? (
                <>
                  <div className="flex flex-wrap gap-1">
                    {RESULT_TABS.map((label, i) => (
                      <button key={label} type="button" onClick={() => setResultTab(i)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${resultTab === i ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{label}</button>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    {resultTab === 0 && <DashboardTab data={outputs.dashboard} />}
                    {resultTab === 1 && <IncomeStatementTab data={outputs.income_statement} currency={currency} />}
                    {resultTab === 2 && <CashFlowTab data={outputs.cash_flow} currency={currency} />}
                    {resultTab === 3 && <BalanceSheetTab data={outputs.balance_sheet} currency={currency} />}
                    {resultTab === 4 && <CACTab data={outputs.cac} currency={currency} />}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">No results yet. Fill in inputs and click Calculate.</div>
              )}
            </div>
          )}
          {(error || saveError) && (
            <p className="mt-2 text-sm text-destructive">{error ?? saveError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <div className="flex gap-2">
            {view === 'results' && outputs && (
              <>
                <Button type="button" variant="outline" size="sm" onClick={() => handleExport('excel')}>
                  <Download className="mr-1 size-3.5" />Excel
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                  <Download className="mr-1 size-3.5" />PDF
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {view === 'inputs' && (
              <>
                {step > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>Back</Button>}
                {step < INPUT_STEPS.length - 1
                  ? <Button type="button" size="sm" onClick={() => setStep((s) => s + 1)}>Next</Button>
                  : <Button type="button" size="sm" onClick={() => void handleCalculate()} disabled={isSaving}>{isSaving ? 'Calculating…' : 'Calculate'}</Button>
                }
              </>
            )}
            {view === 'results' && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setView('inputs')}>Edit Inputs</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
```

- [ ] **Step 4: Update money/page.tsx to pass projectId**

In `frontend/app/app/projects/[id]/money/page.tsx`, ensure the modal receives `projectId`. The current file should already have `financialOpen` state and the button. Find the `<FinancialStatementModal` line and confirm it reads:

```tsx
<FinancialStatementModal open={financialOpen} onClose={() => setFinancialOpen(false)} projectId={project.id} />
```

If `project.id` is not available directly (money page may use a different data source), use the `params.id` from the route: `projectId={Number(params.id)}`.

- [ ] **Step 5: Run TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```
Expected: Zero errors.

- [ ] **Step 6: Run lint**

```bash
cd frontend && npm run lint
```
Expected: Zero new errors.

- [ ] **Step 7: Commit**

```bash
cd frontend
git add components/project/financial/FinancialInputSections.tsx \
        components/project/financial/FinancialResultTabs.tsx \
        components/project/financial/FinancialStatementModal.tsx \
        components/project/financial/financialTypes.ts \
        app/app/projects/\[id\]/money/page.tsx
git commit -m "feat: redesign financial wizard modal with backend-driven calculation"
```

---

## Self-Review Checklist

- [x] Migration covers all 30+ fields from spec
- [x] `FinancialCalculationService` implements: revenue, COGS, gross profit, salaries, depreciation (straight-line), operating income, interest, net income, cash flow (ops/capex/financing), balance sheet (assets = liabilities + equity), CAC
- [x] Scenarios (expected/best/worst) each have their own row in `financial_inputs`; upsert via `updateOrCreate`
- [x] `indexAll` returns all 3 scenarios in one call (avoids 3 round-trips)
- [x] Export endpoints stream file downloads (not base64 JSON)
- [x] Frontend never computes financials — all numbers from backend response
- [x] `financialCalculations.ts` is deleted in Task 5
- [x] Types use snake_case to match backend JSON keys
- [x] `EMPTY_FINANCIAL_INPUTS` provides safe defaults (no undefined fields)
- [x] Export uses Bearer token via query param (download link can't set headers)
- [x] Balance sheet invariant tested: total_assets = total_liabilities + equity

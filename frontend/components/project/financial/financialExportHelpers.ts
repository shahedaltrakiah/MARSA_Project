import type { FinancialInputs } from "./financialTypes"

// One snapshot per month — field names mirror the workbook Monthly Model sheet rows.
export type MonthSnap = {
  unitsSold: number; revenue: number; cashSales: number; creditSales: number
  cashCollected: number; unitsPurchased: number; cogs: number; cashPurchases: number
  creditPurchases: number; cashPaid: number; grossProfit: number
  salaries: number; mgmtSalaries: number; rent: number; utilities: number
  officeSupplies: number; advertising: number; legalFees: number; otherExpenses: number
  totalOpex: number; ebitda: number; depreciation: number; ebit: number
  interest: number; netIncome: number; capex: number; funding: number
  loanRepayment: number; debtService: number; netCashFlow: number
  openingCash: number; endingCash: number; ar: number; inventory: number
  netFixedAssets: number; debtBalance: number; ap: number; equity: number
  totalAssets: number; totalLE: number; balanceCheck: number
}

// [label, annualTotal, monthlyKey]
export type SheetRow = [string, number, keyof MonthSnap]

export const r = (v: number, d = 2): number => Math.round(v * 10 ** d) / 10 ** d
export const n = (s: string | number | undefined): number => {
  const v = parseFloat(String(s ?? 0))
  return Number.isFinite(v) ? v : 0
}
const sl = (v: string, y: string): number => (n(y) > 0 ? n(v) / n(y) : 0)

export const MO_HDRS = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"]

// Pre-compute per-month constants from inputs (all annual ÷ 12 except where noted).
function monthlyCtx(inp: FinancialInputs) {
  const borrowing = n(inp.borrowing)
  const empSalMo = (n(inp.numEmployees) * n(inp.employeeAnnualSalary)) / 12
  const mgrSalMo = (n(inp.numManagers) * n(inp.managerAnnualSalary)) / 12
  const rentMo = n(inp.annualRent) / 12
  const utilMo = n(inp.annualUtilities) / 12
  const officeMo = n(inp.officeSupplies) / 12
  const advMo = n(inp.advertising) / 12
  const legalMo = n(inp.legalFees) / 12
  const otherExpMo = inp.otherExpenses.reduce((s, e) => s + n(e.value), 0) / 12
  const annualDep =
    sl(inp.computers.value, inp.computers.lifeYears) +
    sl(inp.furniture.value, inp.furniture.lifeYears) +
    sl(inp.equipment.value, inp.equipment.lifeYears) +
    inp.otherCapEx.reduce((s, i) => s + sl(i.value, i.lifeYears), 0)
  return {
    borrowing, cashContrib: n(inp.cashContribution),
    monthlyRep: borrowing / Math.max(1, n(inp.loanDuration) * 12),
    monthlyRate: n(inp.interestRate) / 100 / 12,
    depPerMo: annualDep / 12,
    capex:
      n(inp.computers.value) + n(inp.furniture.value) + n(inp.equipment.value) +
      inp.otherCapEx.reduce((s, i) => s + n(i.value), 0),
    funding:
      n(inp.cashContribution) + borrowing +
      inp.otherFunds.reduce((s, f) => s + n(f.value), 0),
    revPerMo: (n(inp.annualUnitsSold) / 12) * n(inp.sellingPricePerUnit),
    cogsPerMo: (n(inp.annualUnitsPurchased) / 12) * n(inp.unitCost),
    csPct: n(inp.creditSalesPercent) / 100,
    cpPct: n(inp.creditPurchasesPercent) / 100,
    unitsPerMo: n(inp.annualUnitsSold) / 12,
    purchPerMo: n(inp.annualUnitsPurchased) / 12,
    empSalMo, mgrSalMo, rentMo, utilMo, officeMo, advMo, legalMo, otherExpMo,
    opexPerMo: empSalMo + mgrSalMo + rentMo + utilMo + officeMo + advMo + legalMo + otherExpMo,
  }
}

// Returns 12 monthly snapshots using workbook-accurate formulas:
//   - full funding + full capex injected every month (workbook design)
//   - AR/AP collected/paid with 1-month lag
//   - declining-balance monthly interest
export function buildMonthlyData(inp: FinancialInputs): MonthSnap[] {
  const c = monthlyCtx(inp)
  const snaps: MonthSnap[] = []
  let prevCS = 0, prevCP = 0, cumNI = 0, openCash = 0

  for (let m = 0; m < 12; m++) {
    const cs = c.revPerMo * c.csPct
    const col = c.revPerMo * (1 - c.csPct) + prevCS
    const cp = c.cogsPerMo * c.cpPct
    const pd = c.cogsPerMo * (1 - c.cpPct) + prevCP
    const gp = c.revPerMo - c.cogsPerMo
    const eb = gp - c.opexPerMo
    const ebt = eb - c.depPerMo
    const int = (c.borrowing - c.monthlyRep * m) * c.monthlyRate
    const ni = ebt - int
    const ds = c.monthlyRep + int
    const ncf = col - pd - c.opexPerMo - c.capex + c.funding - ds
    const ec = openCash + ncf
    const nfa = c.capex * (m + 1) - c.depPerMo * (m + 1)
    const db = c.borrowing - c.monthlyRep * (m + 1)
    cumNI += ni
    const eq = c.cashContrib + cumNI
    const ta = ec + cs + nfa
    const tle = cp + db + eq

    snaps.push({
      unitsSold: r(c.unitsPerMo, 4), revenue: r(c.revPerMo), cashSales: r(c.revPerMo * (1 - c.csPct)),
      creditSales: r(cs), cashCollected: r(col), unitsPurchased: r(c.purchPerMo, 4),
      cogs: r(c.cogsPerMo), cashPurchases: r(c.cogsPerMo * (1 - c.cpPct)), creditPurchases: r(cp),
      cashPaid: r(pd), grossProfit: r(gp), salaries: r(c.empSalMo), mgmtSalaries: r(c.mgrSalMo),
      rent: r(c.rentMo), utilities: r(c.utilMo), officeSupplies: r(c.officeMo),
      advertising: r(c.advMo), legalFees: r(c.legalMo), otherExpenses: r(c.otherExpMo),
      totalOpex: r(c.opexPerMo), ebitda: r(eb), depreciation: r(c.depPerMo), ebit: r(ebt),
      interest: r(int), netIncome: r(ni), capex: r(c.capex), funding: r(c.funding),
      loanRepayment: r(c.monthlyRep), debtService: r(ds), netCashFlow: r(ncf),
      openingCash: r(openCash), endingCash: r(ec), ar: r(cs), inventory: 0,
      netFixedAssets: r(nfa), debtBalance: r(db), ap: r(cp), equity: r(eq),
      totalAssets: r(ta), totalLE: r(tle), balanceCheck: r(ta - tle),
    })
    prevCS = cs; prevCP = cp; openCash = ec
  }
  return snaps
}

export function buildInputRows(inp: FinancialInputs): [string, string | number, string][] {
  const cur = inp.currency || "USD"
  return [
    ["Currency", cur, ""],
    ["Annual Units Sold", n(inp.annualUnitsSold), "units"],
    ["Selling Price per Unit", n(inp.sellingPricePerUnit), cur],
    ["Unit Cost", n(inp.unitCost), cur],
    ["Annual Units Purchased", n(inp.annualUnitsPurchased), "units"],
    ["Annual Rent", n(inp.annualRent), cur],
    ["Annual Utilities", n(inp.annualUtilities), cur],
    ["Office Supplies", n(inp.officeSupplies), cur],
    ["Advertising", n(inp.advertising), cur],
    ["Legal Fees", n(inp.legalFees), cur],
    ["Employees", n(inp.numEmployees), "people"],
    ["Employee Annual Salary", n(inp.employeeAnnualSalary), cur],
    ["Managers", n(inp.numManagers), "people"],
    ["Manager Annual Salary", n(inp.managerAnnualSalary), cur],
    ["Computers Value", n(inp.computers.value), cur],
    ["Computers Life", n(inp.computers.lifeYears), "years"],
    ["Furniture Value", n(inp.furniture.value), cur],
    ["Furniture Life", n(inp.furniture.lifeYears), "years"],
    ["Equipment Value", n(inp.equipment.value), cur],
    ["Equipment Life", n(inp.equipment.lifeYears), "years"],
    ["Cash Contribution", n(inp.cashContribution), cur],
    ["Borrowing", n(inp.borrowing), cur],
    ["Interest Rate", n(inp.interestRate), "%"],
    ["Loan Duration", n(inp.loanDuration), "years"],
    ["Credit Sales %", n(inp.creditSalesPercent), "%"],
    ["Credit Purchases %", n(inp.creditPurchasesPercent), "%"],
  ]
}

export function monthlyModelRowDefs(): [string, string, keyof MonthSnap][] {
  return [
    ["Units Sold",               "annual_units_sold ÷ 12",       "unitsSold"],
    ["Revenue",                  "units_sold × selling_price",   "revenue"],
    ["Cash Sales",               "revenue × (1−credit_pct)",     "cashSales"],
    ["Credit Sales",             "revenue × credit_pct",         "creditSales"],
    ["Cash Collected",           "cash_sales + prior credit",    "cashCollected"],
    ["Units Purchased",          "annual_purchased ÷ 12",        "unitsPurchased"],
    ["COGS",                     "units_purch × unit_cost",      "cogs"],
    ["Cash Purchases",           "cogs × (1−credit_pct)",        "cashPurchases"],
    ["Credit Purchases",         "cogs × credit_pct",            "creditPurchases"],
    ["Cash Paid",                "cash_purch + prior credit",    "cashPaid"],
    ["Gross Profit",             "revenue − cogs",               "grossProfit"],
    ["Employee Salaries",        "emp_salary × employees ÷ 12", "salaries"],
    ["Management Salaries",      "mgr_salary × managers ÷ 12",  "mgmtSalaries"],
    ["Rent",                     "annual_rent ÷ 12",             "rent"],
    ["Utilities",                "annual_utilities ÷ 12",        "utilities"],
    ["Office Supplies",          "office_supplies ÷ 12",         "officeSupplies"],
    ["Advertising",              "advertising ÷ 12",             "advertising"],
    ["Legal Fees",               "legal_fees ÷ 12",              "legalFees"],
    ["Other Expenses",           "sum(other_exp) ÷ 12",          "otherExpenses"],
    ["Total OpEx",               "sum of expense lines",         "totalOpex"],
    ["EBITDA",                   "gross_profit − total_opex",    "ebitda"],
    ["Depreciation",             "annual_dep ÷ 12",              "depreciation"],
    ["EBIT",                     "ebitda − depreciation",        "ebit"],
    ["Interest Expense",         "debt_start × rate÷12",         "interest"],
    ["Net Income",               "ebit − interest",              "netIncome"],
    ["CapEx",                    "total_capex (each month)",      "capex"],
    ["Funding Received",         "total_funding (each month)",   "funding"],
    ["Loan Repayment",           "borrowing ÷ (duration×12)",    "loanRepayment"],
    ["Debt Service",             "repayment + interest",         "debtService"],
    ["Net Cash Flow",            "inflows − outflows",           "netCashFlow"],
    ["Opening Cash",             "prior month ending_cash",      "openingCash"],
    ["Ending Cash",              "opening_cash + net_cf",        "endingCash"],
    ["Accounts Receivable",      "1 month credit sales",         "ar"],
    ["Inventory",                "0 (not modeled)",              "inventory"],
    ["Net Fixed Assets",         "capex×(m+1) − dep×(m+1)",      "netFixedAssets"],
    ["Debt Balance",             "borrowing − rep×(m+1)",        "debtBalance"],
    ["Accounts Payable",         "1 month credit purchases",     "ap"],
    ["Equity",                   "contribution + cum_net_income","equity"],
    ["Total Assets",             "cash + ar + fixed_assets",     "totalAssets"],
    ["Total Liabilities+Equity", "ap + debt + equity",           "totalLE"],
    ["Balance Check",            "total_assets − (L+E)",         "balanceCheck"],
  ]
}

export function isRows(monthly: MonthSnap[]): SheetRow[] {
  const mo = monthly[0]
  const sum = (key: keyof MonthSnap) => r(monthly.reduce((s, m) => s + (m[key] as number), 0))
  return [
    ["Revenue",             r(mo.revenue * 12),         "revenue"],
    ["COGS",                r(mo.cogs * 12),             "cogs"],
    ["Gross Profit",        r(mo.grossProfit * 12),      "grossProfit"],
    ["Employee Salaries",   r(mo.salaries * 12),         "salaries"],
    ["Management Salaries", r(mo.mgmtSalaries * 12),    "mgmtSalaries"],
    ["Rent",                r(mo.rent * 12),             "rent"],
    ["Utilities",           r(mo.utilities * 12),        "utilities"],
    ["Office Supplies",     r(mo.officeSupplies * 12),   "officeSupplies"],
    ["Advertising",         r(mo.advertising * 12),      "advertising"],
    ["Legal Fees",          r(mo.legalFees * 12),        "legalFees"],
    ["Other Expenses",      r(mo.otherExpenses * 12),    "otherExpenses"],
    ["Total OpEx",          r(mo.totalOpex * 12),        "totalOpex"],
    ["EBITDA",              r(mo.ebitda * 12),           "ebitda"],
    ["Depreciation",        r(mo.depreciation * 12),     "depreciation"],
    ["EBIT",                r(mo.ebit * 12),             "ebit"],
    ["Interest Expense",    sum("interest"),              "interest"],
    ["Net Income",          sum("netIncome"),             "netIncome"],
  ]
}

export function cfRows(monthly: MonthSnap[]): SheetRow[] {
  const mo = monthly[0]
  const sum = (key: keyof MonthSnap) => r(monthly.reduce((s, m) => s + (m[key] as number), 0))
  return [
    ["Opening Cash",          0,                           "openingCash"],
    ["Cash Collected",        sum("cashCollected"),        "cashCollected"],
    ["Funding Received",      r(mo.funding * 12),          "funding"],
    ["Cash Paid (Purchases)", sum("cashPaid"),             "cashPaid"],
    ["Total OpEx Paid",       r(mo.totalOpex * 12),        "totalOpex"],
    ["Capital Expenditures",  r(mo.capex * 12),            "capex"],
    ["Debt Service",          sum("debtService"),          "debtService"],
    ["Net Cash Flow",         sum("netCashFlow"),          "netCashFlow"],
    ["Ending Cash",           monthly[11].endingCash,      "endingCash"],
  ]
}

export function bsRows(monthly: MonthSnap[]): SheetRow[] {
  const ye = monthly[11]
  return [
    ["Cash",                     ye.endingCash,    "endingCash"],
    ["Accounts Receivable",      ye.ar,            "ar"],
    ["Inventory",                0,                "inventory"],
    ["Net Fixed Assets",         ye.netFixedAssets,"netFixedAssets"],
    ["Total Assets",             ye.totalAssets,   "totalAssets"],
    ["Accounts Payable",         ye.ap,            "ap"],
    ["Debt Balance",             ye.debtBalance,   "debtBalance"],
    ["Equity",                   ye.equity,        "equity"],
    ["Total Liabilities+Equity", ye.totalLE,       "totalLE"],
    ["Balance Check",            ye.balanceCheck,  "balanceCheck"],
  ]
}

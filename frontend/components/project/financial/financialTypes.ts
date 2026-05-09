export type OtherExpense = { id: string; description: string; value: string }
export type CapExCustomItem = { id: string; name: string; value: string; lifeYears: string }
export type OtherFundSource = { id: string; description: string; value: string }

export type FinancialInputs = {
  currency: string
  productDescription: string
  productCategory: string
  annualUnitsSold: string
  sellingPricePerUnit: string
  unitCost: string
  annualUnitsPurchased: string
  annualRent: string
  annualUtilities: string
  numEmployees: string
  employeeAnnualSalary: string
  numManagers: string
  managerAnnualSalary: string
  officeSupplies: string
  advertising: string
  legalFees: string
  otherExpenses: OtherExpense[]
  computers: { value: string; lifeYears: string }
  furniture: { value: string; lifeYears: string }
  equipment: { value: string; lifeYears: string }
  otherCapEx: CapExCustomItem[]
  cashContribution: string
  borrowing: string
  otherFunds: OtherFundSource[]
  interestRate: string
  loanDuration: string
  creditSalesPercent: string
  creditPurchasesPercent: string
}

export type IncomeStatement = {
  revenue: number
  cogs: number
  grossProfit: number
  grossMarginPct: number
  rent: number
  utilities: number
  salaries: number
  officeSupplies: number
  advertising: number
  legalFees: number
  depreciation: number
  otherExpenses: number
  totalOpEx: number
  ebit: number
  interestExpense: number
  netIncome: number
}

export type BalanceSheet = {
  cash: number
  accountsReceivable: number
  totalCurrentAssets: number
  grossFixedAssets: number
  accumulatedDepreciation: number
  netFixedAssets: number
  totalAssets: number
  accountsPayable: number
  loanBalance: number
  totalLiabilities: number
  ownerEquity: number
  retainedEarnings: number
  totalEquity: number
  totalLiabilitiesAndEquity: number
}

export type CashFlowStatement = {
  netIncome: number
  depreciation: number
  changeInAR: number
  changeInAP: number
  netOperatingCF: number
  capEx: number
  netInvestingCF: number
  cashContribution: number
  borrowingReceived: number
  loanRepayment: number
  netFinancingCF: number
  netChangeCash: number
  beginningCash: number
  endingCash: number
}

export type CACAnalysis = {
  totalMarketingSpend: number
  unitsSold: number
  cacPerUnit: number
  grossProfitPerUnit: number
  ltv: number
  ltvToCacRatio: number
  paybackPeriodMonths: number
}

export type FinancialResults = {
  incomeStatement: IncomeStatement
  balanceSheet: BalanceSheet
  cashFlow: CashFlowStatement
  cac: CACAnalysis
}

export const EMPTY_FINANCIAL_INPUTS: FinancialInputs = {
  currency: "USD",
  productDescription: "",
  productCategory: "",
  annualUnitsSold: "",
  sellingPricePerUnit: "",
  unitCost: "",
  annualUnitsPurchased: "",
  annualRent: "",
  annualUtilities: "",
  numEmployees: "",
  employeeAnnualSalary: "",
  numManagers: "",
  managerAnnualSalary: "",
  officeSupplies: "",
  advertising: "",
  legalFees: "",
  otherExpenses: [],
  computers: { value: "", lifeYears: "" },
  furniture: { value: "", lifeYears: "" },
  equipment: { value: "", lifeYears: "" },
  otherCapEx: [],
  cashContribution: "",
  borrowing: "",
  otherFunds: [],
  interestRate: "",
  loanDuration: "",
  creditSalesPercent: "",
  creditPurchasesPercent: "",
}

export const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "KWD", label: "KWD — Kuwaiti Dinar" },
  { code: "QAR", label: "QAR — Qatari Riyal" },
  { code: "BHD", label: "BHD — Bahraini Dinar" },
  { code: "OMR", label: "OMR — Omani Rial" },
  { code: "JOD", label: "JOD — Jordanian Dinar" },
  { code: "EGP", label: "EGP — Egyptian Pound" },
  { code: "TRY", label: "TRY — Turkish Lira" },
]

export const PRODUCT_CATEGORIES = [
  "Car",
  "Mobile",
  "Software",
  "Deliverable / Service",
  "Consumer Goods",
  "Food & Beverage",
  "Electronics",
  "Clothing / Apparel",
  "Real Estate",
  "Healthcare",
  "Education",
  "Other",
]

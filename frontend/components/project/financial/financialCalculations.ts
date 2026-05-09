import type {
  FinancialInputs,
  FinancialResults,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  CACAnalysis,
} from "./financialTypes"

function n(s: string): number {
  const v = parseFloat(s)
  return Number.isFinite(v) && v >= 0 ? v : 0
}

function slDepreciation(value: string, lifeYears: string): number {
  const v = n(value)
  const y = n(lifeYears)
  return y > 0 ? v / y : 0
}

export function calculate(inputs: FinancialInputs): FinancialResults {
  // Revenue
  const unitsSold = n(inputs.annualUnitsSold)
  const revenue = unitsSold * n(inputs.sellingPricePerUnit)
  const cogs = n(inputs.annualUnitsPurchased) * n(inputs.unitCost)
  const grossProfit = revenue - cogs
  const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0

  // Operating expenses
  const rent = n(inputs.annualRent)
  const utilities = n(inputs.annualUtilities)
  const salaries =
    n(inputs.numEmployees) * n(inputs.employeeAnnualSalary) +
    n(inputs.numManagers) * n(inputs.managerAnnualSalary)
  const officeSupplies = n(inputs.officeSupplies)
  const advertising = n(inputs.advertising)
  const legalFees = n(inputs.legalFees)
  const otherExpenses = inputs.otherExpenses.reduce((s, e) => s + n(e.value), 0)

  // Straight-line depreciation on all CapEx
  const totalDepreciation =
    slDepreciation(inputs.computers.value, inputs.computers.lifeYears) +
    slDepreciation(inputs.furniture.value, inputs.furniture.lifeYears) +
    slDepreciation(inputs.equipment.value, inputs.equipment.lifeYears) +
    inputs.otherCapEx.reduce((s, i) => s + slDepreciation(i.value, i.lifeYears), 0)

  const totalOpEx =
    rent + utilities + salaries + officeSupplies + advertising +
    legalFees + totalDepreciation + otherExpenses

  const ebit = grossProfit - totalOpEx
  const borrowingAmt = n(inputs.borrowing)
  const interestExpense = borrowingAmt * (n(inputs.interestRate) / 100)
  const netIncome = ebit - interestExpense

  // Capital expenditures total
  const totalCapEx =
    n(inputs.computers.value) +
    n(inputs.furniture.value) +
    n(inputs.equipment.value) +
    inputs.otherCapEx.reduce((s, i) => s + n(i.value), 0)

  // Sources of funds
  const cashContrib = n(inputs.cashContribution)
  const otherFunds = inputs.otherFunds.reduce((s, f) => s + n(f.value), 0)
  const totalFunds = cashContrib + borrowingAmt + otherFunds

  // Loan — straight-line principal repayment
  const loanDuration = n(inputs.loanDuration)
  const annualPrincipal = loanDuration > 0 ? borrowingAmt / loanDuration : 0
  const loanBalance = borrowingAmt - annualPrincipal

  // Credit terms — year-end balances (~1 month outstanding)
  const arBalance = (revenue * (n(inputs.creditSalesPercent) / 100)) / 12
  const apBalance = (cogs * (n(inputs.creditPurchasesPercent) / 100)) / 12

  // Cash flow from operations
  const netOperatingCF = netIncome + totalDepreciation - arBalance + apBalance

  // Ending cash = funds raised − capex + operating CF − principal repaid
  const endingCash = totalFunds - totalCapEx + netOperatingCF - annualPrincipal

  // Balance sheet
  const totalCurrentAssets = endingCash + arBalance
  const netFixedAssets = totalCapEx - totalDepreciation
  const totalAssets = totalCurrentAssets + netFixedAssets
  const totalLiabilities = apBalance + loanBalance
  const ownerEquity = cashContrib + otherFunds
  const totalEquity = ownerEquity + netIncome

  // Cash flow statement
  const netInvestingCF = -totalCapEx
  const netFinancingCF = cashContrib + otherFunds + borrowingAmt - annualPrincipal
  const netChangeCash = netOperatingCF + netInvestingCF + netFinancingCF

  // CAC
  const cacPerUnit = unitsSold > 0 ? advertising / unitsSold : 0
  const grossProfitPerUnit = unitsSold > 0 ? grossProfit / unitsSold : 0
  const ltv = grossProfitPerUnit
  const ltvToCacRatio = cacPerUnit > 0 ? ltv / cacPerUnit : 0
  const paybackPeriodMonths = grossProfitPerUnit > 0 ? cacPerUnit / (grossProfitPerUnit / 12) : 0

  const incomeStatement: IncomeStatement = {
    revenue, cogs, grossProfit, grossMarginPct,
    rent, utilities, salaries, officeSupplies, advertising, legalFees,
    depreciation: totalDepreciation, otherExpenses, totalOpEx,
    ebit, interestExpense, netIncome,
  }

  const balanceSheet: BalanceSheet = {
    cash: endingCash, accountsReceivable: arBalance, totalCurrentAssets,
    grossFixedAssets: totalCapEx, accumulatedDepreciation: totalDepreciation,
    netFixedAssets, totalAssets,
    accountsPayable: apBalance, loanBalance, totalLiabilities,
    ownerEquity, retainedEarnings: netIncome, totalEquity,
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
  }

  const cashFlow: CashFlowStatement = {
    netIncome, depreciation: totalDepreciation,
    changeInAR: -arBalance, changeInAP: apBalance,
    netOperatingCF, capEx: -totalCapEx, netInvestingCF,
    cashContribution: cashContrib + otherFunds, borrowingReceived: borrowingAmt,
    loanRepayment: -annualPrincipal, netFinancingCF,
    netChangeCash, beginningCash: 0, endingCash: netChangeCash,
  }

  const cac: CACAnalysis = {
    totalMarketingSpend: advertising, unitsSold, cacPerUnit,
    grossProfitPerUnit, ltv, ltvToCacRatio, paybackPeriodMonths,
  }

  return { incomeStatement, balanceSheet, cashFlow, cac }
}

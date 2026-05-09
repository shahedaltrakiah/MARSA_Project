"use client"

import ExcelJS from "exceljs"
import type { FinancialInputs } from "./financialTypes"
import {
  buildMonthlyData, buildInputRows, monthlyModelRowDefs,
  isRows, cfRows, bsRows, MO_HDRS, type MonthSnap, type SheetRow, n, r,
} from "./financialExportHelpers"

// ─── Palette ──────────────────────────────────────────────────────────────────
const TITLE_BG  = "FF17375E"
const HEADER_BG = "FF4472C4"
const TOTAL_BG  = "FFDAE3F3"
const ALT_BG    = "FFF5F8FF"
const WHITE     = "FFFFFFFF"
const WHITE_FG  = "FFFFFFFF"

const TOTALS = new Set([
  "Gross Profit", "Total OpEx", "EBITDA", "EBIT", "Net Income",
  "Net Cash Flow", "Ending Cash", "Total Assets", "Total Liabilities+Equity",
  "Balance Check", "CAC (Cost per Acquisition)",
])

// ─── Style helpers ─────────────────────────────────────────────────────────────
const solid = (argb: string): ExcelJS.Fill =>
  ({ type: "pattern", pattern: "solid", fgColor: { argb } })

const THIN: ExcelJS.Border = { style: "thin", color: { argb: "FF000000" } }
const BORDER: ExcelJS.Borders = { top: THIN, bottom: THIN, left: THIN, right: THIN, diagonal: THIN }

function styleTitle(ws: ExcelJS.Worksheet, rowNum: number, cols: number): void {
  ws.getRow(rowNum).height = 24
  for (let c = 1; c <= cols; c++) {
    const cell = ws.getCell(rowNum, c)
    cell.fill = solid(TITLE_BG)
    cell.font = { bold: true, size: 13, color: { argb: WHITE_FG } }
    cell.border = BORDER
    cell.alignment = { vertical: "middle", horizontal: "left" }
  }
}

function styleHeader(ws: ExcelJS.Worksheet, rowNum: number, cols: number): void {
  ws.getRow(rowNum).height = 18
  for (let c = 1; c <= cols; c++) {
    const cell = ws.getCell(rowNum, c)
    cell.fill = solid(HEADER_BG)
    cell.font = { bold: true, size: 10, color: { argb: WHITE_FG } }
    cell.border = BORDER
    cell.alignment = { vertical: "middle", horizontal: c === 1 ? "left" : "right" }
  }
}

function styleData(ws: ExcelJS.Worksheet, rowNum: number, label: string, dataIdx: number, cols: number): void {
  const isTotal = TOTALS.has(label)
  const bg = isTotal ? TOTAL_BG : dataIdx % 2 === 0 ? WHITE : ALT_BG
  ws.getRow(rowNum).height = 15
  for (let c = 1; c <= cols; c++) {
    const cell = ws.getCell(rowNum, c)
    cell.fill = solid(bg)
    cell.font = { bold: isTotal, size: 10 }
    cell.border = BORDER
    cell.alignment = { vertical: "middle", horizontal: c === 1 ? "left" : "right" }
    if (c > 1 && typeof cell.value === "number") cell.numFmt = "#,##0.00"
  }
}

// ─── Sheet builders ────────────────────────────────────────────────────────────

function buildInputsSheet(wb: ExcelJS.Workbook, inp: FinancialInputs): void {
  const ws = wb.addWorksheet("Inputs")
  ws.columns = [{ width: 30 }, { width: 18 }, { width: 10 }]

  ws.addRow(["Financial Model Inputs", null, null])
  ws.mergeCells("A1:C1")
  styleTitle(ws, 1, 3)

  ws.addRow(["Label", "Value", "Unit"])
  styleHeader(ws, 2, 3)

  buildInputRows(inp).forEach((row, i) => {
    ws.addRow(row)
    styleData(ws, i + 3, row[0], i, 3)
  })
}

function buildMonthlyModelSheet(wb: ExcelJS.Workbook, monthly: MonthSnap[]): void {
  const cols = 14
  const ws = wb.addWorksheet("Monthly Model")
  ws.columns = [{ width: 28 }, { width: 30 }, ...Array(12).fill({ width: 13 })]

  ws.addRow(["Monthly Model"])
  ws.mergeCells(1, 1, 1, cols)
  styleTitle(ws, 1, cols)

  ws.addRow(["Line Item", "Formula Logic", ...MO_HDRS])
  styleHeader(ws, 2, cols)

  monthlyModelRowDefs().forEach(([label, logic, key], i) => {
    ws.addRow([label, logic, ...monthly.map((m) => m[key])])
    styleData(ws, i + 3, label, i, cols)
  })

  // Hide the Formula Logic column per export requirements
  ws.getColumn(2).hidden = true
}

function buildMonthlySheet(
  wb: ExcelJS.Workbook,
  name: string,
  col2Header: string,
  rows: SheetRow[],
  monthly: MonthSnap[],
): void {
  const cols = 14
  const ws = wb.addWorksheet(name)
  ws.columns = [{ width: 28 }, { width: 16 }, ...Array(12).fill({ width: 13 })]

  ws.addRow([name])
  ws.mergeCells(1, 1, 1, cols)
  styleTitle(ws, 1, cols)

  ws.addRow(["Line Item", col2Header, ...MO_HDRS])
  styleHeader(ws, 2, cols)

  rows.forEach(([label, annual, key], i) => {
    ws.addRow([label, annual, ...monthly.map((m) => m[key])])
    styleData(ws, i + 3, label, i, cols)
  })
}

function buildCACSheet(wb: ExcelJS.Workbook, inp: FinancialInputs, monthly: MonthSnap[]): void {
  const ws = wb.addWorksheet("CAC")
  ws.columns = [{ width: 34 }, { width: 18 }]

  ws.addRow(["Customer Acquisition Cost (CAC)", null])
  ws.mergeCells("A1:B1")
  styleTitle(ws, 1, 2)

  ws.addRow(["Metric", "Value"])
  styleHeader(ws, 2, 2)

  const advSpend = r(monthly[0].advertising * 12)
  const unitsSold = r(monthly[0].unitsSold * 12)
  const cac = unitsSold > 0 ? r(advSpend / unitsSold, 4) : 0
  const rows: [string, number][] = [
    ["Advertising Spend", advSpend],
    ["Units Sold (Acquired)", unitsSold],
    ["CAC (Cost per Acquisition)", cac],
  ]
  rows.forEach(([label, value], i) => {
    ws.addRow([label, value])
    styleData(ws, i + 3, label, i, 2)
  })

  ws.addRow([])
  ws.addRow([`Note: CAC = Advertising Spend ÷ Units Sold  |  Currency: ${inp.currency || "USD"}`])
}

function buildDashboardSheet(wb: ExcelJS.Workbook, inp: FinancialInputs, monthly: MonthSnap[]): void {
  const ws = wb.addWorksheet("Dashboard")
  ws.columns = [{ width: 22 }, { width: 16 }, { width: 4 }, { width: 8 }, { width: 14 }, { width: 14 }]

  const mo = monthly[0], ye = monthly[11]
  const annualRev = r(mo.revenue * 12)
  const annualGP = r(mo.grossProfit * 12)
  const annualNI = r(monthly.reduce((s, m) => s + m.netIncome, 0))
  const cm = n(inp.sellingPricePerUnit) - n(inp.unitCost)
  const breakEven = cm > 0 ? r(r(mo.totalOpex * 12) / cm) : "N/A"
  const cac = mo.unitsSold * 12 > 0 ? r(r(mo.advertising * 12) / (mo.unitsSold * 12), 4) : 0
  const metrics: [string, number | string][] = [
    ["Annual Revenue",   annualRev],
    ["Gross Profit",     annualGP],
    ["Net Income",       annualNI],
    ["Gross Margin %",   annualRev > 0 ? r((annualGP / annualRev) * 100) : 0],
    ["Net Margin %",     annualRev > 0 ? r((annualNI / annualRev) * 100) : 0],
    ["Year-End Cash",    ye.endingCash],
    ["Break-Even Units", breakEven],
    ["CAC",              cac],
    ["Debt at Year-End", ye.debtBalance],
  ]

  ws.addRow([`Financial Dashboard (${inp.currency || "USD"})`, null, null, null, null, null])
  ws.mergeCells("A1:F1")
  styleTitle(ws, 1, 6)

  ws.addRow([null, null, null, null, null, null])

  // Header row for both KPI table and monthly table
  ws.addRow(["Metric", "Value", null, "Month", "Revenue", "Ending Cash"])
  ws.getRow(3).height = 18
  for (const c of [1, 2, 4, 5, 6]) {
    const cell = ws.getCell(3, c)
    cell.fill = solid(HEADER_BG)
    cell.font = { bold: true, size: 10, color: { argb: WHITE_FG } }
    cell.border = BORDER
    cell.alignment = { vertical: "middle", horizontal: c === 1 ? "left" : "right" }
  }

  for (let i = 0; i < 12; i++) {
    const rowNum = i + 4
    const [mLabel, mValue] = i < metrics.length ? metrics[i] : [null, null]
    ws.addRow([mLabel, mValue, null, `M${i + 1}`, monthly[i].revenue, monthly[i].endingCash])
    const bg = i % 2 === 0 ? WHITE : ALT_BG
    ws.getRow(rowNum).height = 15
    for (const c of [1, 2, 4, 5, 6]) {
      const cell = ws.getCell(rowNum, c)
      cell.fill = solid(bg)
      cell.font = { size: 10 }
      cell.border = BORDER
      cell.alignment = { vertical: "middle", horizontal: c === 1 || c === 4 ? "left" : "right" }
      if (c > 1 && typeof cell.value === "number") cell.numFmt = "#,##0.00"
    }
  }
}

// ─── Main entry point ──────────────────────────────────────────────────────────

export async function exportToExcel(inp: FinancialInputs): Promise<void> {
  const monthly = buildMonthlyData(inp)
  const wb = new ExcelJS.Workbook()
  wb.creator = "MARSA Financial Wizard"

  buildInputsSheet(wb, inp)
  buildMonthlyModelSheet(wb, monthly)
  buildMonthlySheet(wb, "Income Statement", "Annual Total", isRows(monthly), monthly)
  buildMonthlySheet(wb, "Cash Flow",        "Annual Total", cfRows(monthly), monthly)
  buildMonthlySheet(wb, "Balance Sheet",    "Year End",     bsRows(monthly), monthly)
  buildCACSheet(wb, inp, monthly)
  buildDashboardSheet(wb, inp, monthly)

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "financial-statement.xlsx"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

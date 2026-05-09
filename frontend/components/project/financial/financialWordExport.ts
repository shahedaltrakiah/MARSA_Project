"use client"

import {
  AlignmentType, Document, HeadingLevel, Packer, Paragraph,
  ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from "docx"
import type { FinancialInputs } from "./financialTypes"
import {
  buildMonthlyData, buildInputRows, isRows, cfRows, bsRows,
  type MonthSnap, type SheetRow, n, r,
} from "./financialExportHelpers"

// ─── Palette ──────────────────────────────────────────────────────────────────
const NAVY   = "17375E"
const BLUE   = "4472C4"
const L_BLUE = "DAE3F3"
const ALT    = "F5F8FF"
const WHITE  = "FFFFFF"

// ─── Layout constants ─────────────────────────────────────────────────────────
const COL_LABEL = 6000  // DXA (twips)
const COL_VALUE = 2500
const TABLE_W   = COL_LABEL + COL_VALUE

const TOTALS = new Set([
  "Gross Profit", "Total OpEx", "EBITDA", "EBIT", "Net Income",
  "Net Cash Flow", "Ending Cash", "Total Assets", "Total Liabilities+Equity",
  "Balance Check",
])

// ─── Cell helpers ─────────────────────────────────────────────────────────────

function fmt(v: number | string, cur: string): string {
  if (typeof v !== "number") return String(v)
  return `${cur} ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: BLUE, type: ShadingType.CLEAR, color: "auto" },
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text, bold: true, color: WHITE, size: 18 })],
    })],
  })
}

function dataCell(
  text: string | number,
  width: number,
  isLabel: boolean,
  isTotal: boolean,
  fill: string,
  cur: string,
): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR, color: "auto" },
    children: [new Paragraph({
      alignment: isLabel ? AlignmentType.LEFT : AlignmentType.RIGHT,
      children: [new TextRun({ text: isLabel ? String(text) : fmt(text, cur), bold: isTotal, size: 18 })],
    })],
  })
}

function headerRow(cols: string[]): TableRow {
  return new TableRow({
    tableHeader: true,
    children: cols.map((c, i) => headerCell(c, i === 0 ? COL_LABEL : COL_VALUE)),
  })
}

function dataRow(label: string, value: number | string, idx: number, cur: string): TableRow {
  const isTotal = TOTALS.has(label)
  const fill = isTotal ? L_BLUE : idx % 2 === 0 ? WHITE : ALT
  return new TableRow({
    children: [
      dataCell(label, COL_LABEL, true,  isTotal, fill, cur),
      dataCell(value, COL_VALUE, false, isTotal, fill, cur),
    ],
  })
}

function twoColTable(col2Header: string, rows: SheetRow[], cur: string): Table {
  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    rows: [
      headerRow(["Line Item", col2Header]),
      ...rows.map(([label, annual], i) => dataRow(label, annual, i, cur)),
    ],
  })
}

// ─── Section helpers ──────────────────────────────────────────────────────────

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: NAVY })],
  })
}

const spacer = (): Paragraph => new Paragraph({ spacing: { before: 200 } })

// ─── Sheet builders ────────────────────────────────────────────────────────────

function buildCACRows(inp: FinancialInputs, monthly: MonthSnap[], cur: string): Table {
  const advSpend = r(monthly[0].advertising * 12)
  const unitsSold = r(monthly[0].unitsSold * 12)
  const cac = unitsSold > 0 ? r(advSpend / unitsSold, 4) : 0
  const rows: [string, number][] = [
    ["Advertising Spend", advSpend],
    ["Units Sold (Acquired)", unitsSold],
    ["CAC (Cost per Acquisition)", cac],
  ]
  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    rows: [
      headerRow(["Metric", "Value"]),
      ...rows.map(([label, value], i) => dataRow(label, value, i, cur)),
    ],
  })
}

function buildKPIRows(inp: FinancialInputs, monthly: MonthSnap[], cur: string): Table {
  const mo = monthly[0], ye = monthly[11]
  const annualRev = r(mo.revenue * 12)
  const annualGP  = r(mo.grossProfit * 12)
  const annualNI  = r(monthly.reduce((s, m) => s + m.netIncome, 0))
  const cm        = n(inp.sellingPricePerUnit) - n(inp.unitCost)
  const breakEven = cm > 0 ? r(r(mo.totalOpex * 12) / cm) : "N/A"
  const cac       = mo.unitsSold * 12 > 0 ? r(r(mo.advertising * 12) / (mo.unitsSold * 12), 4) : 0
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
  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    rows: [
      headerRow(["KPI", "Value"]),
      ...metrics.map(([label, value], i) => dataRow(label, value, i, cur)),
    ],
  })
}

// ─── Main entry point ──────────────────────────────────────────────────────────

export async function exportToWord(inp: FinancialInputs): Promise<void> {
  const monthly = buildMonthlyData(inp)
  const cur = inp.currency || "USD"

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
      },
      children: [
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Financial Statement", bold: true, size: 48, color: NAVY })],
        }),
        new Paragraph({
          spacing: { after: 600 },
          children: [new TextRun({ text: `Currency: ${cur}`, size: 22, color: "666666" })],
        }),

        heading("Income Statement"),
        twoColTable("Annual Total", isRows(monthly), cur),

        spacer(),
        heading("Cash Flow"),
        twoColTable("Annual Total", cfRows(monthly), cur),

        spacer(),
        heading("Balance Sheet (Year End)"),
        twoColTable("Year End", bsRows(monthly), cur),

        spacer(),
        heading("Customer Acquisition Cost"),
        buildCACRows(inp, monthly, cur),

        spacer(),
        heading("Key Performance Indicators"),
        buildKPIRows(inp, monthly, cur),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "financial-statement.docx"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

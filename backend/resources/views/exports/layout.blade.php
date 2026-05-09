<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        /* DomPDF: use literal hex — avoid CSS variables */
        @page { margin: 16mm 14mm; }
        body {
            font-family: DejaVu Sans, Helvetica, Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.5;
            color: #334155;
            margin: 0;
            position: relative;
            background: #ffffff;
        }
        .watermark-layer {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
        }
        .watermark-layer img {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 220px;
            height: auto;
            margin-left: -110px;
            margin-top: -110px;
            opacity: 0.11;
        }
        .sheet {
            position: relative;
            z-index: 1;
        }
        .marsa-svg-mark {
            margin-bottom: 10px;
        }
        .marsa-svg-mark svg {
            display: block;
        }
        .doc-header-logo-row {
            margin-bottom: 10px;
        }
        .doc-brand-logo {
            max-height: 56px;
            width: auto;
            display: block;
        }
        .doc-logo-header {
            height: 38px;
            width: auto;
            display: block;
        }
        .doc-header {
            margin: 0 0 14px 0;
            padding: 14px 16px 16px;
            background-color: #eef2ff;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            border-left: 5px solid #4f46e5;
        }
        .doc-header h1 {
            margin: 0 0 6px 0;
            font-size: 19pt;
            font-weight: bold;
            letter-spacing: -0.02em;
            color: #0f172a;
        }
        .doc-badge {
            display: inline-block;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #4f46e5;
            background: #ffffff;
            border: 1px solid #c7d2fe;
            padding: 3px 10px;
            border-radius: 999px;
            margin-bottom: 6px;
        }
        .meta {
            font-size: 9pt;
            color: #64748b;
            margin: 0;
        }
        .meta strong {
            color: #0d9488;
            font-weight: bold;
        }
        h2 {
            font-size: 12.5pt;
            margin: 1.35em 0 0.55em 0;
            padding: 8px 10px 8px 12px;
            color: #0f172a;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #4f46e5;
            border-radius: 0 6px 6px 0;
        }
        h2.page-break {
            page-break-before: always;
        }
        h3.growth-subhead {
            font-size: 11pt;
            margin: 1em 0 0.45em 0;
            padding: 5px 0 5px 10px;
            color: #0f766e;
            border-left: 3px solid #14b8a6;
            background-color: #f0fdfa;
        }
        .labeled-block {
            margin: 0 0 10px 0;
            padding: 10px 12px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            border-top: 3px solid #c7d2fe;
        }
        .labeled-block:nth-child(even) {
            border-top-color: #99f6e4;
            background-color: #fafafa;
        }
        h4.pillar-label {
            margin: 0 0 8px 0;
            font-size: 9.5pt;
            font-weight: bold;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        p {
            margin: 0.35em 0;
        }
        .bullet-line {
            margin: 0.35em 0 0.35em 10px;
            padding-left: 8px;
            border-left: 2px solid #0d9488;
            color: #334155;
        }
        .muted-line {
            color: #64748b;
            font-style: italic;
            margin: 0;
            padding: 8px 10px;
            background-color: #f1f5f9;
            border-radius: 4px;
            border: 1px dashed #cbd5e1;
        }
        strong, b {
            color: #0f172a;
        }
        table.canvas-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px;
            table-layout: fixed;
            margin-top: 4px;
        }
        table.canvas-grid td {
            vertical-align: top;
            padding: 10px 10px 12px;
            height: 130px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        table.canvas-grid td:nth-child(1) {
            background-color: #eef2ff;
            border-top: 3px solid #4f46e5;
        }
        table.canvas-grid td:nth-child(2) {
            background-color: #ccfbf1;
            border-top: 3px solid #0d9488;
        }
        table.canvas-grid td:nth-child(3) {
            background-color: #ede9fe;
            border-top: 3px solid #7c3aed;
        }
        table.canvas-grid h4 {
            margin: 0 0 8px 0;
            font-size: 8.5pt;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #0f172a;
        }
        table.canvas-grid td:nth-child(1) h4 { color: #4f46e5; }
        table.canvas-grid td:nth-child(2) h4 { color: #0f766e; }
        table.canvas-grid td:nth-child(3) h4 { color: #7c3aed; }
        .canvas-cell-body {
            font-size: 8.5pt;
            color: #334155;
        }
        .canvas-cell-body .muted-line {
            background-color: #ffffff;
        }
    </style>
    @stack('head')
</head>
<body>
@if (!empty($watermarkDataUri))
    <div class="watermark-layer">
        <img src="{{ $watermarkDataUri }}" alt="">
    </div>
@endif
<div class="sheet">
    @yield('content')
</div>
</body>
</html>

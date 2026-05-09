@extends('exports.layout')

@push('head')
    <style>
        /* A4 landscape: wider usable area for 3×3 canvas */
        @page { margin: 11mm 14mm; }
        table.canvas-grid td {
            height: auto;
            min-height: 105px;
        }
    </style>
@endpush

@section('content')
    <header class="doc-header">
        <div class="doc-header-logo-row">
            @include('exports.partials.marsa-mark')
        </div>
        <div class="doc-badge">Business Model Canvas</div>
        <h1>{{ $projectName }}</h1>
        <p class="meta">Generated <strong>{{ $generatedAt }}</strong> &middot; Nine building blocks</p>
    </header>

    @php
        $rows = array_chunk($blocks, 3);
    @endphp

    @foreach ($rows as $rowIndex => $row)
        @if ($rowIndex > 0)
            <div style="height:6px;"></div>
        @endif
        <table class="canvas-grid">
            <tr>
                @foreach ($row as $block)
                    <td>
                        <h4>{{ $block['title'] }}</h4>
                        <div class="canvas-cell-body">{!! $block['html'] !!}</div>
                    </td>
                @endforeach
                @for ($i = count($row); $i < 3; $i++)
                    <td style="background:#f8fafc;border-style:dashed;"></td>
                @endfor
            </tr>
        </table>
    @endforeach
@endsection

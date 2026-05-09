@extends('exports.layout')

@section('content')
    <header class="doc-header">
        <div class="doc-header-logo-row">
            @include('exports.partials.marsa-mark')
        </div>
        <div class="doc-badge">Business plan</div>
        <h1>{{ $projectName }}</h1>
        <p class="meta">Generated <strong>{{ $generatedAt }}</strong> &middot; MARSA workspace export</p>
    </header>

    <h2>Executive summary</h2>
    {!! $executiveSummaryHtml !!}

    <h2 class="page-break">Offering</h2>
    {!! $offeringHtml !!}

    <h2 class="page-break">Market &amp; customer</h2>
    {!! $marketCustomerHtml !!}

    <h2 class="page-break">Reach (marketing &amp; sales)</h2>
    {!! $reachHtml !!}

    <h2 class="page-break">Money (revenue, investment, cashflow)</h2>
    {!! $moneyHtml !!}

    <h2 class="page-break">Growth plan</h2>
    {!! $growthPlanHtml !!}
@endsection

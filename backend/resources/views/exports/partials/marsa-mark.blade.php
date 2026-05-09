{{-- PNG lockup when GD can embed (see ExportWatermark); else SVG text mark for DomPDF without GD. --}}
@if (!empty($headerLogoDataUri))
    <img
        src="{{ $headerLogoDataUri }}"
        alt="MARSA"
        class="doc-brand-logo"
        width="260"
        height="auto"
    />
@else
    <div class="marsa-svg-mark">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 44" width="200" height="36" aria-hidden="true">
            <defs>
                <linearGradient id="marsaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#4f46e5"/>
                    <stop offset="100%" style="stop-color:#0d9488"/>
                </linearGradient>
            </defs>
            <text x="0" y="32" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="26" font-weight="bold" fill="url(#marsaGrad)">MARSA</text>
            <text x="118" y="32" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="#64748b">Founders</text>
            <rect x="0" y="38" width="210" height="3" rx="1.5" fill="url(#marsaGrad)" opacity="0.85"/>
        </svg>
    </div>
@endif

{{-- CID-embedded logo so inboxes do not depend on APP_URL or localhost image URLs. --}}
<tr>
    <td style="padding:26px 28px;background:#0a0a0a;text-align:center;">
        @isset($message)
            <img
                src="{{ $message->embed(public_path('assets/marsa-brand-lockup.png')) }}"
                alt="MARSA — BUILD VENTURES. ANCHOR IMPACT."
                width="280"
                style="display:block;max-width:100%;height:auto;margin:0 auto;border:0;outline:none;text-decoration:none;"
            >
        @else
            <span style="font-size:18px;font-weight:700;color:#f8fafc;letter-spacing:0.04em;">MARSA Founders</span>
        @endisset
    </td>
</tr>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your email</title>
</head>
<body style="margin:0;padding:0;background:#e8eef7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(165deg,#e0e7ff 0%,#ccfbf1 45%,#faf5ff 100%);padding:40px 16px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.12);border:1px solid #e2e8f0;">
                @include('emails.marsa.partials.header-brand')
                <tr>
                    <td style="padding:28px 32px 8px;">
                        <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#334155;">
                            Hi {{ $userName }},
                        </p>
                        <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#475569;">
                            Thanks for joining MARSA. Confirm your email address to secure your account and receive project updates.
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;">
                            <tr>
                                <td style="border-radius:10px;background:linear-gradient(135deg,#4f46e5,#6366f1);box-shadow:0 4px 14px rgba(79,70,229,0.35);">
                                    <a href="{{ $actionUrl }}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
                                        Confirm email address
                                    </a>
                                </td>
                            </tr>
                        </table>
                        <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#64748b;">
                            This link expires in {{ config('auth.verification.expire', 60) }} minutes. If you didn’t create an account, you can ignore this message.
                        </p>
                        <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;word-break:break-all;">
                            Button not working? Paste this URL into your browser:<br>
                            <span style="color:#6366f1;">{{ $actionUrl }}</span>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 32px 28px;border-top:1px solid #f1f5f9;background:#fafafa;">
                        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                            Sent by MARSA Founders · <a href="mailto:info@marsafounders.com" style="color:#6366f1;text-decoration:none;">info@marsafounders.com</a>
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>

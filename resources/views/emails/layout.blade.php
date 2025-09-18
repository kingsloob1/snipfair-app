<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $subject ?? 'Snipfair' }}</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
        }

        /* Container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #9333EA 0%, #DB2777 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }

        .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 1rem;
            padding: 8px;
            height: 100px;
            width: 100px;
        }

        .logo-image {
            height: 100%;
            width: 100%;
            border-radius: 8px;
        }

        .brand-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .brand-tagline {
            font-size: 14px;
            opacity: 0.9;
        }

        /* Content */
        .email-content {
            padding: 2rem;
        }

        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #111827;
        }

        .content-section {
            margin-bottom: 1.5rem;
        }

        .content-section p {
            margin-bottom: 1rem;
            color: #4b5563;
            line-height: 1.6;
        }

        /* Buttons */
        .btn {
            display: inline-block;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            transition: all 0.2s;
            margin: 0.5rem 0;
        }

        .btn-primary {
            background: linear-gradient(135deg, #9333EA 0%, #DB2777 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
        }

        .btn-secondary {
            background-color: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
        }

        .btn-block {
            display: block;
            width: 100%;
        }

        /* Code/OTP styles */
        .otp-code {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px dashed #9333EA;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
            margin: 1.5rem 0;
        }

        .otp-code .code {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 32px;
            font-weight: bold;
            color: #9333EA;
            letter-spacing: 8px;
        }

        /* Alert boxes */
        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }

        .alert-info {
            background-color: #dbeafe;
            border-left: 4px solid #3b82f6;
            color: #1e40af;
        }

        .alert-warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            color: #92400e;
        }

        .alert-success {
            background-color: #d1fae5;
            border-left: 4px solid #10b981;
            color: #065f46;
        }

        /* Tables */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .table th,
        .table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        .table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
        }

        /* Footer */
        .email-footer {
            background-color: #f9fafb;
            padding: 2rem;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .email-footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 0.5rem;
        }

        .social-links {
            margin: 1rem 0;
        }

        .social-links a {
            display: inline-block;
            margin: 0 0.5rem;
            color: #9333EA;
            text-decoration: none;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                width: 100% !important;
            }

            .email-header,
            .email-content,
            .email-footer {
                padding: 1.5rem 1rem;
            }

            .brand-name {
                font-size: 24px;
            }

            .otp-code .code {
                font-size: 24px;
                letter-spacing: 4px;
            }
        }

        /* Admin email styles - simpler design */
        .admin-email {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
        }

        .admin-email .email-header {
            background: #374151;
            padding: 1rem;
        }

        .admin-email .brand-name {
            font-size: 20px;
        }

        .admin-email .email-content {
            padding: 1.5rem;
        }

        .admin-email .email-footer {
            background-color: #f9fafb;
            padding: 1rem;
        }
    </style>
</head>
<body>
    <div class="email-container {{ $isAdmin ?? false ? 'admin-email' : '' }}">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">
                <img
                    className="logo-img"
                    src={{ url('/images/logo/logo_white_large.png') }} alt="Logo"
                />
            </div>
            @if(!($isAdmin ?? false))
                <div class="brand-tagline">Your trusted platform for professional beauty services</div>
            @endif
        </div>

        <!-- Main Content -->
        <div class="email-content">
            @yield('content')
        </div>

        <!-- Footer -->
        <div class="email-footer">
            @if(!($isAdmin ?? false))
                <div class="social-links">
                    <a href="https://www.facebook.com/share/1BmTa4YwyA/?mibextid=wwXIfr" target="_blank">Facebook</a>
                    <a href="https://whatsapp.com/channel/0029VbBMml684OmGJcIVmp3b" target="_blank">WhatsApp</a>
                    <a href="https://www.instagram.com/snipfair" target="_blank">Instagram</a>
                    <a href="https://www.tiktok.com/@snipfair" target="_blank">TikTok</a>
                </div>
            @endif

            <p>&copy; {{ date('Y') }} Snipfair. All rights reserved.</p>
            <p>This message was sent to <strong>{{ $recipientEmail ?? 'you' }}</strong>. It is intended solely for the use of the individual or entity to whom it is addressed and may contain confidential or privileged information. If you are not the intended recipient, please notify the sender immediately and delete this email. Any unauthorized review, use, disclosure, or distribution is prohibited.</p>

            @if(!($isAdmin ?? false))
                <p style="font-size: 12px; margin-top: 1rem;">
                    If you no longer wish to receive these emails, you can
                    <a href="#" style="color: #9333EA;">unsubscribe here</a>.
                </p>
            @endif
        </div>
    </div>
</body>
</html>

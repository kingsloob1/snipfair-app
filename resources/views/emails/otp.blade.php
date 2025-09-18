@extends('emails.layout')

@section('content')
    <div class="greeting">
        Hello {{ $name }}! 🔐
    </div>

    <div class="content-section">
        <p>
            @if($purpose === 'verification')
                You requested an email verification code for your Snipfair account.
            @else
                You requested a security code for your Snipfair account.
            @endif
        </p>

        <p>Please use the following code to complete the process:</p>
    </div>

    <div class="otp-code">
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 0.5rem;">Your Code:</div>
        <div class="code">{{ $code }}</div>
    </div>

    <div class="alert alert-warning">
        <strong>⚠️ Important:</strong> This code will expire in 10 minutes for your security.
    </div>

    <div class="content-section">
        <p><strong>Security Notice:</strong></p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
            <li>Never share this code with anyone</li>
            <li>Snipfair will never ask for this code via phone or text</li>
            <li>If you didn't request this code, please ignore this email</li>
        </ul>
    </div>

    <div class="content-section">
        <p>If you're having trouble with verification or didn't request this code, please contact our support team immediately.</p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Security Team</strong>
        </p>
    </div>
@endsection

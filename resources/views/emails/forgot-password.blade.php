@extends('emails.layout')

@section('content')
    <div class="greeting">
        {{ $name ? "Hello $name" : 'Hello' }}! 🔑
    </div>

    <div class="content-section">
        <p>We received a request to reset the password for your Snipfair account.</p>

        <p>If you made this request, click the button below to reset your password:</p>
    </div>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ $resetLink }}" class="btn btn-primary btn-block">Reset Your Password</a>
    </div>

    <div class="alert alert-info">
        <strong>🔒 Security Notice:</strong> This password reset link will expire in 60 minutes for your security.
    </div>

    <div class="content-section">
        <p><strong>If you can't click the button above, copy and paste this link into your browser:</strong></p>
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 1rem; margin: 1rem 0; word-break: break-all; font-family: monospace; font-size: 14px;">
            {{ $resetLink }}
        </div>
    </div>

    <div class="alert alert-warning">
        <strong>⚠️ Didn't request this?</strong><br>
        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        For additional security, consider changing your password after logging in.
    </div>

    <div class="content-section">
        <p><strong>Need help?</strong> If you continue to have problems, please contact our support team.</p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

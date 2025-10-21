@extends('emails.layout')

@section('content')
    <div class="greeting">
        Hello, {{ $stylist->name }}!
    </div>

    <div class="content-section">
        <p>Your withdrawal request was declined, and the funds have been refunded to your wallet!</p>
    </div>

    <div class="alert alert-success">
        <strong>❌ Withdrawal Failed:</strong>
    </div>

    <div class="content-section">
        <table class="table">
            <tr>
                <th style="width: 40%;">Withdrawal Amount</th>
                <td style="color: #ef4444; font-weight: 600;">-R{{ number_format($withdrawal->amount, 2) }}</td>
            </tr>
            {{-- <tr>
                <th>Reference ID</th>
                <td>{{ $withdrawal->reference_id }}</td>
            </tr> --}}
            {{-- <tr>
                <th>Payment Method</th>
                <td>{{ $withdrawal->payment_method ?? 'Bank Transfer' }}</td>
            </tr> --}}
            <tr>
                <th>Rejected On</th>
                <td>{{ $withdrawal->updated_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
            @if($newBalance !== null)
                <tr>
                    <th>New Account Balance</th>
                    <td style="color: #9333EA; font-weight: 600;">R{{ number_format($newBalance, 2) }}</td>
                </tr>
            @endif
        </table>
    </div>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ url('/stylist/earnings') }}" class="btn btn-primary" style="color: white;">View Earnings</a>
    </div>

    <div class="content-section">
        <p><strong>Transfer Details:</strong></p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
            {{-- <li>Funds will appear in your account within 3-5 business days</li> --}}
            {{-- <li>You'll receive a notification from your bank once received</li>
            --}}
            <li>Keep this email as a record of the transaction</li>
            <li>Contact support if you don't receive the refund in your wallet</li>
        </ul>
    </div>

    <div class="alert alert-info">
        <strong>📋 Transaction Record:</strong> Save this email for your financial records and tax purposes.
    </div>

    {{-- <div class="content-section">
        <p><strong>Transaction Summary:</strong></p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
            <p style="margin: 0; font-family: monospace; font-size: 14px; color: #4b5563;">
                Transaction ID: {{ $withdrawal->id }}<br>
                Status: <span style="color: #10b981; font-weight: 600;">Completed</span><br>
                Method: {{ $withdrawal->payment_method ?? 'Bank Transfer' }}<br>
                Date: {{ $withdrawal->updated_at->format('M j, Y g:i A') }}<br>
                @if($withdrawal->account_details)
                Account: {{ $withdrawal->account_details }}
                @endif
            </p>
        </div>
    </div> --}}

    <div class="content-section">
        <p>Thank you for being part of the Snipfair community. Keep up the great work providing excellent services to our clients!</p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

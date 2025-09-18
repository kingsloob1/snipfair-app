@extends('emails.layout')

@section('content')
    <div class="greeting">
        Great news, {{ $customer->name }}! 🎉
    </div>

    <div class="content-section">
        <p>Your deposit has been successfully processed and added to your Snipfair wallet!</p>
    </div>

    <div class="alert alert-success">
        <strong>✅ Deposit Confirmed:</strong>
         {{-- {{ $deposit->reference_id }} --}}
    </div>

    <div class="content-section">
        <table class="table">
            <tr>
                <th style="width: 40%;">Deposit Amount</th>
                <td style="color: #10b981; font-weight: 600;">+R{{ number_format($deposit->amount, 2) }}</td>
            </tr>
            {{-- <tr>
                <th>Reference ID</th>
                <td>{{ $deposit->reference_id }}</td>
            </tr> --}}
            <tr>
                <th>Payment Method</th>
                <td>{{ 'Bank Transfer' }}</td>
                {{-- $deposit->payment_method ??  --}}
            </tr>
            <tr>
                <th>Processed On</th>
                <td>{{ $deposit->updated_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
            @if($newBalance)
            <tr>
                <th>New Wallet Balance</th>
                <td style="color: #9333EA; font-weight: 600;">R{{ number_format($newBalance, 2) }}</td>
            </tr>
            @endif
        </table>
    </div>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ url('/customer/wallet') }}" class="btn btn-primary" style="color: white;">View Wallet</a>
    </div>

    <div class="content-section">
        <p><strong>What you can do now:</strong></p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
            <li>Book appointments with your favorite stylists</li>
            <li>Pay for services securely through your wallet</li>
            <li>Track all your transactions in one place</li>
            <li>Enjoy faster checkout for future bookings</li>
        </ul>
    </div>

    <div class="alert alert-info">
        <strong>💡 Pro Tip:</strong> Maintain a wallet balance for quicker bookings and instant confirmations with stylists!
    </div>

    <div class="content-section">
        <p><strong>Transaction Details:</strong></p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
            <p style="margin: 0; font-family: monospace; font-size: 14px; color: #4b5563;">
                Transaction ID: {{ $deposit->id }}<br>
                Status: <span style="color: #10b981; font-weight: 600;">Completed</span><br>
                Method: {{ $deposit->payment_method ?? 'Bank Transfer' }}<br>
                Date: {{ $deposit->updated_at->format('M j, Y g:i A') }}
            </p>
        </div>
    </div>

    <div class="content-section">
        <p>Your funds are now available for use. Start booking amazing services with our professional stylists!</p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

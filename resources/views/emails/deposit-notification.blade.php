@extends('emails.layout')

@section('content')
    @if($recipientType === 'admin')
        <div class="greeting">
            New Deposit Request 💰
        </div>

        <div class="content-section">
            <p>A new deposit request has been submitted and requires review.</p>
        </div>

        <table class="table">
            <tr>
                <th style="width: 30%;">Customer</th>
                <td>{{ $user->name }}</td>
            </tr>
            <tr>
                <th>Email</th>
                <td>{{ $user->email }}</td>
            </tr>
            <tr>
                <th>Amount</th>
                <td>R{{ number_format($deposit->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Payment Method</th>
                <td>{{ $deposit->payment_method ? $deposit->payment_method->account_name.' ('.$deposit->payment_method->bank_name.')' : 'Not specified' }}</td>
            </tr>
            <tr>
                <th>Status</th>
                <td>{{ ucfirst($deposit->status) }}</td>
            </tr>
            <tr>
                <th>Submitted</th>
                <td>{{ $deposit->created_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
        </table>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/admin/transactions/') }}" class="btn btn-primary" style="color: white;">Review Deposit</a>
             {{-- . $deposit->id --}}
        </div>

    @else
        <div class="greeting">
            Hello {{ $user->name }}! 💰
        </div>

        <div class="content-section">
            <p>Your deposit request has been successfully submitted for review.</p>
        </div>

        <table class="table">
            <tr>
                <th style="width: 40%;">Amount</th>
                <td>R{{ number_format($deposit->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Payment Method</th>
                <td>{{ 'Bank Transfer' }}</td>
            </tr>
            <tr>
                <th>Status</th>
                <td>{{ ucfirst($deposit->status) }}</td>
            </tr>
            <tr>
                <th>Submitted</th>
                <td>{{ $deposit->created_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
        </table>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/customer/wallet') }}" class="btn btn-primary" style="color: white;">View Wallet</a>
        </div>

        <div class="content-section">
            <p><strong>What happens next?</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Our team will review your deposit request</li>
                <li>You'll receive email confirmation once processed</li>
                <li>Funds will be added to your wallet within 24-48 hours</li>
                <li>You can track the status in your wallet section</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⏰ Processing Time:</strong> Deposits are typically processed within 24-48 hours during business days.
        </div>
    @endif

    <div class="content-section">
        @if($recipientType === 'admin')
            <p>Please review and process this deposit request promptly.</p>
        @else
            <p>Thank you for using Snipfair. We'll notify you once your deposit is processed.</p>
        @endif

        <p style="margin-top: 2rem;">
            @if($recipientType === 'admin')
                <strong>Snipfair Admin System</strong>
            @else
                Best regards,<br>
                <strong>The Snipfair Team</strong>
            @endif
        </p>
    </div>
@endsection

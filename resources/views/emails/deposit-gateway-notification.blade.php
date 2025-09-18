@extends('emails.layout')

@section('content')
    @if($recipientType === 'admin')
        <div class="greeting">
            Payment Received 💳
        </div>

        <div class="content-section">
            <p>A payment has been successfully completed through {{ $gateway }} secure payment gateway.</p>
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
                <td>Secure Payment Gateway</td>
            </tr>
            <tr>
                <th>Status</th>
                <td>{{ ucfirst($deposit->status) }}</td>
            </tr>
            <tr>
                <th>Transaction ID</th>
                <td>{{ $deposit->transaction_id ?? 'N/A' }}</td>
            </tr>
            <tr>
                <th>Completed</th>
                <td>{{ $deposit->updated_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
        </table>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/admin/transactions/') }}" class="btn btn-primary" style="color: white;">View Transaction</a>
        </div>

        <div class="content-section">
            <p><strong>Transaction Details:</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Payment processed automatically via {{ $gateway }} secure gateway</li>
                <li>Funds have been added to customer's wallet</li>
                <li>Customer has been notified of successful payment</li>
                <li>No further action required</li>
            </ul>
        </div>

    @else
        <div class="greeting">
            Hello {{ $user->name }}! 💳
        </div>

        <div class="content-section">
            <p>Your payment request has been initiated on our secure payment gateway. Please complete your payment to add funds to your wallet.</p>
        </div>

        <table class="table">
            <tr>
                <th style="width: 40%;">Amount</th>
                <td>R{{ number_format($deposit->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Payment Method</th>
                <td>Secure Payment Gateway</td>
            </tr>
            <tr>
                <th>Status</th>
                <td>{{ ucfirst($deposit->status) }}</td>
            </tr>
            <tr>
                <th>Initiated</th>
                <td>{{ $deposit->created_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
        </table>

        <div class="content-section">
            <p><strong>What happens next?</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Complete your payment on the {{ $gateway }} secure gateway</li>
                <li>Your payment will be confirmed within a few minutes</li>
                <li>Funds will be automatically added to your wallet</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⏰ Important:</strong> Please complete your payment on the {{ $gateway }} payment gateway tab. If you don't complete the payment, this request will expire and you'll need to initiate a new deposit request.
        </div>
    @endif

    <div class="content-section">
        @if($recipientType === 'admin')
            <p>This is an automated notification from the payment gateway system.</p>
        @else
            <p>Thank you for using Snipfair. Once your payment is complete, you'll receive a confirmation email and your wallet will be updated immediately.</p>
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

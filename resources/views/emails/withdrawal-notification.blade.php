@extends('emails.layout')

@section('content')
    @if($recipientType === 'admin')
        <div class="greeting">
            New Withdrawal Request 💸
        </div>

        <div class="content-section">
            <p>A new withdrawal request has been submitted and requires review.</p>
        </div>

        <table class="table">
            <tr>
                <th style="width: 30%;">Stylist</th>
                <td>{{ $user->name }}</td>
            </tr>
            <tr>
                <th>Email</th>
                <td>{{ $user->email }}</td>
            </tr>
            {{-- <tr>
                <th>Reference ID</th>
                <td>{{ $withdrawal->reference_id }}</td>
            </tr> --}}
            <tr>
                <th>Amount</th>
                <td>R{{ number_format($withdrawal->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Payment Method</th>
                <td>{{ $withdrawal->payment_method ? $withdrawal->payment_method->bank_name : 'N/A' }}</td>
            </tr>
            <tr>
                <th>Account Details</th>
                <td>{{ $withdrawal->payment_method ? $withdrawal->payment_method->account_number : 'N/A' }}</td>
            </tr>
            <tr>
                <th>Status</th>
                <td>{{ ucfirst($withdrawal->status) }}</td>
            </tr>
            <tr>
                <th>Submitted</th>
                <td>{{ $withdrawal->created_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
        </table>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/admin/transactions/') }}" class="btn btn-primary" style="color: white;">Review Withdrawal</a>
             {{-- . $withdrawal->id --}}
        </div>

    @else
        <div class="greeting">
            Hello {{ $user->name }}! 💸
        </div>

        <div class="content-section">
            <p>Your withdrawal request has been successfully submitted for review.</p>
        </div>

        {{-- <div class="alert alert-info">
            <strong>Reference ID:</strong> {{ $withdrawal->reference_id }}
        </div> --}}

        <table class="table">
            <tr>
                <th style="width: 40%;">Amount</th>
                <td>R{{ number_format($withdrawal->amount, 2) }}</td>
            </tr>
            {{-- <tr>
                <th>Payment Method</th>
                <td>{{ $withdrawal->payment_method ?? 'Bank Transfer' }}</td>
            </tr> --}}
            <tr>
                <th>Status</th>
                <td>{{ ucfirst($withdrawal->status) }}</td>
            </tr>
            <tr>
                <th>Submitted</th>
                <td>{{ $withdrawal->created_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
            @if($withdrawal->fee)
                <tr>
                    <th>Processing Fee</th>
                    <td>R{{ number_format($withdrawal->fee, 2) }}</td>
                </tr>
                <tr>
                    <th>Net Amount</th>
                    <td style="font-weight: 600;">R{{ number_format($withdrawal->amount - $withdrawal->fee, 2) }}</td>
                </tr>
            @endif
        </table>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/stylist/earnings') }}" class="btn btn-primary" style="color: white;">View Earnings</a>
        </div>

        <div class="content-section">
            <p><strong>What happens next?</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Our team will review your withdrawal request</li>
                <li>We'll verify your account details</li>
                <li>You'll receive confirmation once processed</li>
                <li>Funds will be transferred within 3-5 business days</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⏰ Processing Time:</strong> Withdrawals are processed within 1-2 business days after approval.
        </div>
    @endif

    <div class="content-section">
        @if($recipientType === 'admin')
            <p>Please review and process this withdrawal request according to company policies.</p>
        @else
            <p>Thank you for being a valued member of our stylist community. We'll notify you once your withdrawal is processed.</p>
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

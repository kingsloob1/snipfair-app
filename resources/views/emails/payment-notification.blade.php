@extends('emails.layout')

@section('content')
    @if($recipientType === 'admin')
        <div class="greeting">
            Payment Processed 💳
        </div>

        <div class="content-section">
            <p>A payment has been successfully processed for appointment {{ $appointment->appointment_code }}.</p>
        </div>

        <table class="table">
            <tr>
                <th style="width: 30%;">Payment ID</th>
                <td>{{ $payment->reference_id }}</td>
            </tr>
            <tr>
                <th>Appointment</th>
                <td>{{ $appointment->appointment_code }}</td>
            </tr>
            <tr>
                <th>Customer</th>
                <td>{{ $appointment->customer->name }}</td>
            </tr>
            <tr>
                <th>Stylist</th>
                <td>{{ $appointment->stylist->name }}</td>
            </tr>
            <tr>
                <th>Amount</th>
                <td>R{{ number_format($payment->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Platform Fee</th>
                <td>R{{ number_format($payment->platform_fee ?? 0, 2) }}</td>
            </tr>
            <tr>
                <th>Stylist Earnings</th>
                <td>R{{ number_format($payment->stylist_amount ?? ($payment->amount - ($payment->platform_fee ?? 0)), 2) }}</td>
            </tr>
            <tr>
                <th>Payment Method</th>
                <td>{{ $payment->payment_method ?? 'Wallet' }}</td>
            </tr>
            <tr>
                <th>Status</th>
                <td>{{ ucfirst($payment->status) }}</td>
            </tr>
            <tr>
                <th>Processed</th>
                <td>{{ $payment->created_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
        </table>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/admin/payments/' . $payment->id) }}" class="btn btn-primary" style="color: white;">View Payment Details</a>
        </div>

    @else
        <div class="greeting">
            Great news, {{ $recipient->name }}! 💰
        </div>

        <div class="content-section">
            <p>You've received a payment for your completed service!</p>
        </div>

        <div class="alert alert-success">
            <strong>✅ Payment Received:</strong> {{ $payment->reference_id }}
        </div>

        <table class="table">
            <tr>
                <th style="width: 40%;">Service Amount</th>
                <td>R{{ number_format($payment->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Platform Fee</th>
                <td style="color: #ef4444;">-R{{ number_format($payment->platform_fee ?? 0, 2) }}</td>
            </tr>
            <tr>
                <th>Your Earnings</th>
                <td style="color: #10b981; font-weight: 600;">+R{{ number_format($payment->stylist_amount ?? ($payment->amount - ($payment->platform_fee ?? 0)), 2) }}</td>
            </tr>
            <tr>
                <th>Appointment</th>
                <td>{{ $appointment->appointment_code }}</td>
            </tr>
            <tr>
                <th>Customer</th>
                <td>{{ $appointment->customer->name }}</td>
            </tr>
            <tr>
                <th>Service Date</th>
                <td>{{ \Carbon\Carbon::parse($appointment->appointment_date)->format('F j, Y') }}</td>
            </tr>
            <tr>
                <th>Payment Method</th>
                <td>{{ $payment->payment_method ?? 'Customer Wallet' }}</td>
            </tr>
            <tr>
                <th>Processed</th>
                <td>{{ $payment->created_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
        </table>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/stylist/earnings') }}" class="btn btn-primary" style="color: white;">View Earnings</a>
        </div>

        <div class="content-section">
            <p><strong>What's next?</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Your earnings are now available in your account</li>
                <li>You can request a withdrawal anytime</li>
                <li>Consider asking the customer for a review</li>
                <li>Keep providing excellent service to earn more</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>💡 Pro Tip:</strong> Consistent excellent service leads to repeat customers and higher earnings!
        </div>
    @endif

    <div class="content-section">
        <p><strong>Payment Summary:</strong></p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
            <p style="margin: 0; font-family: monospace; font-size: 14px; color: #4b5563;">
                Transaction ID: {{ $payment->id }}<br>
                Reference: {{ $payment->reference_id }}<br>
                Status: <span style="color: #10b981; font-weight: 600;">{{ ucfirst($payment->status) }}</span><br>
                Date: {{ $payment->created_at->format('M j, Y g:i A') }}<br>
                Method: {{ $payment->payment_method ?? 'Wallet' }}
            </p>
        </div>
    </div>

    <div class="content-section">
        @if($recipientType === 'admin')
            <p>Payment processing completed successfully.</p>
        @else
            <p>Thank you for providing excellent service through Snipfair!</p>
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

@extends('emails.layout')

@section('content')
    <div class="greeting">
        Hello {{ $recipient->name }}! ✅
    </div>

    <div class="content-section">
        <p>The dispute for appointment <strong>{{ $appointment->booking_id }}</strong> has been resolved.</p>
    </div>

    <div class="alert alert-success">
        <strong>✅ Dispute Resolved:</strong> {{ $dispute->ref_id }}
    </div>

    <div class="content-section">
        <table class="table">
            <tr>
                <th style="width: 40%;">Appointment ID</th>
                <td>{{ $appointment->booking_id }}</td>
            </tr>
            <tr>
                <th>Service Date</th>
                <td>{{ \Carbon\Carbon::parse($appointment->appointment_date)->format('F j, Y') }}</td>
            </tr>
            <tr>
                <th>Original Amount</th>
                <td>R{{ number_format($appointment->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Resolution Date</th>
                <td>{{ $dispute->updated_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
            <tr>
                <th>Final Status</th>
                <td style="color: #10b981; font-weight: 600;">{{ ucfirst(str_replace('_', ' ', $dispute->status)) }}</td>
            </tr>
        </table>
    </div>

    <div class="content-section">
        <p><strong>Resolution Details:</strong></p>
        <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 1rem; margin: 1rem 0;">
            {{ $resolution }}
        </div>
    </div>

    @if($dispute->refund_amount && $dispute->refund_amount > 0)
    <div class="alert alert-info">
        <strong>💰 Refund Information:</strong><br>
        @if($recipientType === 'customer')
            A refund of R{{ number_format($dispute->refund_amount, 2) }} will be processed to your original payment method within 3-5 business days.
        @else
            A refund of R{{ number_format($dispute->refund_amount, 2) }} has been issued to the customer.
        @endif
    </div>
    @endif

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ url('/' . $recipientType . '/disputes/' . $dispute->id) }}" class="btn btn-primary" style="color: white;">View Resolution Details</a>
    </div>

    <div class="content-section">
        <p><strong>What this means for you:</strong></p>
        @if($recipientType === 'customer')
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>The dispute case is now closed</li>
                @if($dispute->refund_amount > 0)
                    <li>Your refund will be processed automatically</li>
                @endif
                <li>You can continue booking services with confidence</li>
                <li>You may leave feedback about the resolution process</li>
            </ul>
        @else
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>The dispute case is now closed</li>
                @if($dispute->refund_amount > 0)
                    <li>The refund amount will be deducted from your earnings</li>
                @else
                    <li>No financial adjustments are required</li>
                @endif
                <li>You can continue providing services</li>
                <li>Consider the feedback to improve future services</li>
            </ul>
        @endif
    </div>

    <div class="content-section">
        <p><strong>Resolution Summary:</strong></p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
            <p style="margin: 0; font-family: monospace; font-size: 14px; color: #4b5563;">
                Dispute ID: {{ $dispute->ref_id }}<br>
                Status: <span style="color: #10b981; font-weight: 600;">{{ ucfirst($dispute->status) }}</span><br>
                Resolved By: Admin Team<br>
                Date: {{ $dispute->updated_at->format('M j, Y g:i A') }}<br>
                @if($dispute->refund_amount > 0)
                Refund: R{{ number_format($dispute->refund_amount, 2) }}
                @endif
            </p>
        </div>
    </div>

    <div class="alert alert-warning">
        <strong>📝 Feedback:</strong> Your experience helps us improve. Consider leaving feedback about this resolution to help us serve you better in the future.
    </div>

    <div class="content-section">
        <p>Thank you for your patience during this process. We're committed to providing fair and prompt resolution to all disputes.</p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Support Team</strong>
        </p>
    </div>
@endsection

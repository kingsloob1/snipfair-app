@extends('emails.layout')

@section('content')
    @if($recipientType === 'admin')
        <div class="greeting">
            New Dispute Filed ⚠️
        </div>

        <div class="content-section">
            <p>A new appointment dispute has been filed and requires immediate attention.</p>
        </div>

        <table class="table">
            <tr>
                <th style="width: 30%;">Dispute ID</th>
                <td>{{ $dispute->ref_id }}</td>
            </tr>
            <tr>
                <th>Appointment</th>
                <td>{{ $appointment->booking_id }}</td>
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
                <th>Filed By</th>
                <td>{{ $dispute->filed_by_customer ? 'Customer' : 'Stylist' }}</td>
            </tr>
            <tr>
                <th>Priority</th>
                <td>{{ ucfirst($dispute->priority) }}</td>
            </tr>
            <tr>
                <th>Category</th>
                <td>{{ $dispute->category }}</td>
            </tr>
            <tr>
                <th>Amount</th>
                <td>R{{ number_format($appointment->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Filed On</th>
                <td>{{ $dispute->created_at->format('F j, Y \a\t g:i A') }}</td>
            </tr>
        </table>

        <div class="content-section">
            <p><strong>Description:</strong></p>
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
                {{ $dispute->description }}
            </div>
        </div>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/admin/disputes/' . $dispute->id) }}" class="btn btn-primary" style="color: white;">Review Dispute</a>
        </div>

    @else
        <div class="greeting">
            Hello {{ $recipient->name }}! ⚠️
        </div>

        <div class="content-section">
            @if($recipientType === 'customer')
                @if($dispute->from === 'customer')
                    <p>Your dispute has been successfully filed for appointment <strong>{{ $appointment->booking_id }}</strong>.</p>
                @else
                    <p>A dispute has been filed by the stylist for your appointment <strong>{{ $appointment->booking_id }}</strong>.</p>
                @endif
            @else
                @if($dispute->from === 'stylist')
                    <p>Your dispute has been successfully filed for appointment <strong>{{ $appointment->booking_id }}</strong>.</p>
                @else
                    <p>A dispute has been filed by the customer for appointment <strong>{{ $appointment->booking_id }}</strong>.</p>
                @endif
            @endif
        </div>

        <div class="alert alert-warning">
            <strong>Dispute ID:</strong> {{ $dispute->ref_id }}
        </div>

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
                <th>Amount</th>
                <td>R{{ number_format($appointment->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Priority</th>
                <td>{{ ucfirst($dispute->priority) }}</td>
            </tr>
            <tr>
                <th>Status</th>
                <td>{{ ucfirst(str_replace('_', ' ', $dispute->status)) }}</td>
            </tr>
        </table>

        <div class="content-section">
            <p><strong>Initial issue:</strong></p>
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin: 1rem 0;">
                {{ $dispute->comment }}
            </div>
        </div>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/disputes/' . $dispute->id) }}" class="btn btn-primary" style="color: white;">View Dispute</a>
        </div>

        <div class="content-section">
            <p><strong>What happens next?</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Our team will review the dispute within 24 hours</li>
                <li>Both parties may be contacted for additional information</li>
                <li>You can add comments or evidence through the dispute page</li>
                <li>A resolution will be provided within 3-5 business days</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📋 Important:</strong> Please provide any additional evidence or documentation that supports your case through the dispute interface.
        </div>
    @endif

    <div class="content-section">
        @if($recipientType === 'admin')
            <p>Please prioritize this dispute based on its urgency and follow standard resolution procedures.</p>
        @else
            <p>We take all disputes seriously and will work to resolve this matter fairly and promptly.</p>
        @endif

        <p style="margin-top: 2rem;">
            @if($recipientType === 'admin')
                <strong>Snipfair Admin System</strong>
            @else
                Best regards,<br>
                <strong>The Snipfair Support Team</strong>
            @endif
        </p>
    </div>
@endsection

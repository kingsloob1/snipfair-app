@extends('emails.layout')

@section('content')
    <div class="greeting">
        Hello {{ $stylist->name }}! 📅
    </div>

    <div class="content-section">
        <p>Great news! You have a new appointment booking from <strong>{{ $customer->name }}</strong>.</p>
    </div>

    <div class="alert alert-info">
        <strong>Booking ID:</strong> {{ $appointment->appointment_code }}
    </div>

    <div class="content-section">
        <table class="table">
            <tr>
                <th style="width: 40%;">Client Name</th>
                <td>{{ $customer->name }}</td>
            </tr>
            <tr>
                <th>Service</th>
                <td>{{ $portfolio->title }}</td>
            </tr>
            <tr>
                <th>Service Amount</th>
                <td>R{{ number_format($appointment->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Service Date</th>
                <td>{{ $appointment->appointment_date_time->format('F j, Y') }}</td>
            </tr>
            <tr>
                <th>Service Time</th>
                <td>{{ $appointment->appointment_date_time->format('g:i A') }}</td>
            </tr>
            <tr>
                <th>Duration</th>
                <td>{{ $appointment->duration }}</td>
            </tr>
            @if($appointment->extra)
                <tr>
                    <th>Special Notes</th>
                    <td>{{ $appointment->extra }}</td>
                </tr>
            @endif
            @if($appointment->service_notes)
                <tr>
                    <th>Address</th>
                    <td>{{ $appointment->service_notes }}</td>
                </tr>
            @endif
        </table>
    </div>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ url('/stylist/appointment/' . $appointment->id) }}" class="btn btn-primary" style="color: white;">View Appointment Details</a>
    </div>

    <div class="content-section">
        <p><strong>Next Steps:</strong></p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
            <li>Review the appointment details</li>
            <li>Confirm your availability</li>
            <li>Prepare for the service</li>
            <li>Contact the client if you have any questions</li>
        </ul>
    </div>

    <div class="alert alert-warning">
        <strong>⏰ Important:</strong> Please confirm or reschedule this appointment within 24 hours to maintain your response rate.
    </div>

    <div class="content-section">
        <p>Thank you for providing excellent service to our community!</p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

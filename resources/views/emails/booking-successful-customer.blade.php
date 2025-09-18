@extends('emails.layout')

@section('content')
    <div class="greeting">
        Hello {{ $customer->name }}! ✅
    </div>

    <div class="content-section">
        <p>Your appointment has been successfully booked! We're excited to help you look and feel your best.</p>
    </div>

    <div class="alert alert-success">
        <strong>✅ Booking Confirmed:</strong> {{ $appointment->appointment_code }}
    </div>

    <div class="content-section">
        <table class="table">
            <tr>
                <th style="width: 40%;">Stylist</th>
                <td>{{ $stylist->name }}</td>
            </tr>
            <tr>
                <th>Service Date</th>
                <td>{{ \Carbon\Carbon::parse($appointment->appointment_date)->format('F j, Y') }}</td>
            </tr>
            <tr>
                <th>Service Time</th>
                <td>{{ \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A') }}</td>
            </tr>
            <tr>
                <th>Duration</th>
                <td>{{ $appointment->duration }}</td>
            </tr>
            <tr>
                <th>Total Amount</th>
                <td>R{{ number_format($appointment->amount, 2) }}</td>
            </tr>
            @if($appointment->service_notes)
            <tr>
                <th>Your Location</th>
                <td>{{ $appointment->service_notes }}</td>
            </tr>
            @endif
        </table>
    </div>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ url('/customer/appointment/' . $appointment->id) }}" class="btn btn-primary" style="color: white;">View Appointment</a>
    </div>

    <div class="content-section">
        <p><strong>What happens next?</strong></p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
            <li>Your stylist will confirm the appointment</li>
            <li>You'll receive a reminder 24 hours before your appointment</li>
            <li>You can contact your stylist directly through the app</li>
            <li>Payment will be processed securely after service completion</li>
        </ul>
    </div>

    <div class="alert alert-info">
        <strong>💡 Tip:</strong> You can reschedule or cancel your appointment up to 24 hours before the scheduled time.
    </div>

    <div class="content-section">
        <p><strong>Preparation Tips:</strong></p>
        <div style="background-color: #f8fafc; border-left: 4px solid #9333EA; padding: 1rem; margin: 1rem 0;">
            <ul style="margin: 0; padding-left: 1rem; color: #4b5563;">
                <li>Be available 5-10 minutes early</li>
                <li>Have reference photos ready if applicable</li>
                <li>Communicate any allergies or preferences</li>
                <li>Ensure good lighting in your chosen location</li>
            </ul>
        </div>
    </div>

    <div class="content-section">
        <p>We can't wait for you to experience amazing service. If you have any questions, feel free to reach out!</p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

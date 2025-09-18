@extends('emails.layout')

@section('content')
    <div class="greeting">
        Hello {{ $recipient->name }}! ⏰
    </div>

    <div class="content-section">
        <p>
            @if($recipientType === 'customer')
                This is a friendly reminder about your upcoming appointment {{ $type === 'hour' ? 'in one hour' : 'tomorrow' }}.
            @else
                This is a reminder about your upcoming client appointment {{ $type === 'hour' ? 'in one hour' : 'tomorrow' }}.
            @endif
        </p>
    </div>

    <div class="alert alert-info">
        <strong>📅 Appointment Details:</strong> {{ \Carbon\Carbon::parse($appointment->appointment_date)->format('F j, Y') }} at {{ \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A') }}
    </div>

    <div class="content-section">
        <table class="table">
            <tr>
                <th style="width: 40%;">
                    @if($recipientType === 'customer')
                        Stylist
                    @else
                        Client
                    @endif
                </th>
                <td>{{ $otherParty->name }}</td>
            </tr>
            <tr>
                <th>Contact</th>
                <td>{{ $otherParty->phone ?? $otherParty->email }}</td>
            </tr>
            <tr>
                <th>Date & Time</th>
                <td>{{ \Carbon\Carbon::parse($appointment->appointment_date)->format('F j, Y') }} at {{ \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A') }}</td>
            </tr>
            <tr>
                <th>Duration</th>
                <td>{{ $appointment->duration }}</td>
            </tr>
            <tr>
                <th>Service Amount</th>
                <td>R{{ number_format($appointment->amount, 2) }}</td>
            </tr>
            <tr>
                <th>Location</th>
                <td>{{ $appointment->service_notes }}</td>
            </tr>
        </table>
    </div>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ url('/' . $recipientType . '/appointment/' . $appointment->id) }}" class="btn btn-primary" style="color: white;">View Details</a>
    </div>

    <div class="content-section">
        @if($recipientType === 'customer')
            <p><strong>Preparation Checklist:</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>✓ Confirm you'll be available at the scheduled time</li>
                <li>✓ Prepare your space with good lighting</li>
                <li>✓ Have reference photos ready if needed</li>
                <li>✓ Ensure you have the stylist's contact information</li>
                <li>✓ Be ready 5-10 minutes before the appointment</li>
            </ul>
        @else
            <p><strong>Service Checklist:</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>✓ Confirm your availability and equipment</li>
                <li>✓ Review any special requests or notes</li>
                <li>✓ Plan your travel time to the location</li>
                <li>✓ Have the client's contact information ready</li>
                <li>✓ Arrive on time and be professional</li>
            </ul>
        @endif
    </div>

    @if($appointment->extra)
    <div class="alert alert-warning">
        <strong>📝 Special Notes:</strong><br>
        {{ $appointment->extra }}
    </div>
    @endif

    <div class="content-section">
        <p>
            @if($recipientType === 'customer')
                Need to reschedule? You can do so up to in your dashboard.
            @else
                If you need to make any changes, please contact your client as soon as possible.
            @endif
        </p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

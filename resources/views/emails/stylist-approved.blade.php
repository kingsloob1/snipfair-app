@extends('emails.layout')

@section('content')
    <div class="greeting">
        Congratulations, {{ $stylistName }}! 🎉
    </div>

    <div class="content-section">
        <p>Your profile is now <strong>verified and live on Snipfair!</strong></p>

        <p>Clients can now discover your services, view your portfolio, and book you directly.</p>
    </div>

    <div class="content-section">
        <p><strong>Here's how to make the most of your profile:</strong></p>
        <div style="background-color: #f8fafc; border-left: 4px solid #9333EA; padding: 1rem; margin: 1rem 0;">
            <ul style="margin: 0; padding-left: 1rem; color: #4b5563;">
                <li><strong>1️⃣ Keep Your Calendar Updated</strong> – Avoid missed opportunities.</li>
                <li><strong>2️⃣ Respond Quickly to Booking Requests</strong> – Fast responses = happy clients.</li>
                <li><strong>3️⃣ Collect Reviews</strong> – Positive feedback builds trust and boosts your ranking.</li>
                <li><strong>4️⃣ Post Fresh Photos</strong> – Showcase your latest work to stay relevant.</li>
            </ul>
        </div>
    </div>

    <div class="alert alert-success">
        💡 <strong>Pro Tip:</strong> Verified stylists who keep their profiles active and updated often get up to 3x more bookings.
    </div>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ url('/stylist/dashboard') }}" class="btn btn-primary btn-block">Log In to Manage Bookings</a>
    </div>

    <div class="content-section">
        <p><strong>We're here to help</strong></p>
        <p>Have questions or need support? Contact us anytime at <a href="mailto:support@snipfair.com" style="color: #9333EA;">support@snipfair.com</a>.</p>

        <p style="margin-top: 2rem;">
            Let's make beauty happen,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

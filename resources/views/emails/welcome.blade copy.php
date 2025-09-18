@extends('emails.layout')

@section('content')
    <div class="greeting">
        Welcome to Snipfair, {{ $name }}! 🎉
    </div>

    @if($bannerImage)
        <div style="text-align: center; margin: 1.5rem 0;">
            <img src="{{ $bannerImage }}" alt="Welcome Banner" style="max-width: 100%; height: auto; border-radius: 8px;">
        </div>
    @endif

    <div class="content-section">
        <p>We're thrilled to have you join our community of beauty enthusiasts!</p>

        @if($userType === 'stylist')
            <p>As a stylist on Snipfair, you now have access to a platform where you can showcase your skills, connect with clients, and grow your business. Here's what you can do:</p>

            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Create and manage your professional portfolio</li>
                <li>Set your availability and pricing</li>
                <li>Connect with clients in your area</li>
                <li>Receive secure payments for your services</li>
                <li>Build your reputation through client reviews</li>
            </ul>

            <div style="text-align: center; margin: 2rem 0;">
                <a href="{{ url('/stylist/dashboard') }}" class="btn btn-primary" style="color: white;">Complete Your Profile</a>
            </div>
        @else
            <p>As a valued member of Snipfair, you now have access to professional beauty and styling services at your fingertips. Here's what you can enjoy:</p>

            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Browse verified professional stylists in your area</li>
                <li>Book appointments that fit your schedule</li>
                <li>Enjoy secure and convenient payment options</li>
                <li>Rate and review your experience</li>
                <li>Access exclusive promotions and rewards</li>
            </ul>

            <div style="text-align: center; margin: 2rem 0;">
                <a href="{{ url('/dashboard') }}" class="btn btn-primary" style="color: white;">Explore Services</a>
            </div>
        @endif
    </div>

    <div class="alert alert-info">
        <strong>💡 Getting Started Tip:</strong>
        @if($userType === 'stylist')
            Complete your profile and upload your portfolio to start attracting clients!
        @else
            Use our search filters to find the perfect stylist for your needs.
        @endif
    </div>

    <div class="content-section">
        <p>If you have any questions or need assistance, our support team is always here to help. Welcome aboard!</p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

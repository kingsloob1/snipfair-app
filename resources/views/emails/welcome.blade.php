@extends('emails.layout')

@section('content')
    <div class="greeting">
        Hi, {{ $name }}! 🎉
    </div>

    <div class="content-section">
        <p><strong>Welcome to Snipfair</strong></p>

        @if ($userType === 'stylist')
            <p>You're now part of a community that's redefining beauty services, giving talented professionals like you the tools to work smarter, earn more, and connect with clients who value your craft.</p>
        @else
            <p>You've just joined a community where beauty and convenience meet. Whether it's a fresh hairstyle, flawless nails, or a full glam session our trusted, pre-vetted stylists come straight to you.</p>
        @endif

        <p>Here's how to get started:</p>

        @if($userType === 'stylist')

            <ol style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>1️⃣ Set Up Your Profile – Add your best work photos, bio, and service details.</li>
                <li>2️⃣ Verify Your Profile – Upload required documents so our team can confirm your account. Only verified profiles are active and visible to clients.</li>
                <li>3️⃣ List Your Services – Be clear, creative, and showcase what makes you stand out.</li>
                <li>4️⃣ Manage Your Schedule – Choose when and where you want to work.</li>
                <li>5️⃣ Accept Bookings – Get paid quickly and grow your client base.</li>
            </ol>

            <div style="text-align: center; margin: 2rem 0;">
                <a href="{{ url('/stylist/dashboard') }}" class="btn btn-primary" style="color: white;">Log In & Complete Profile</a>
            </div>
        @else
            <ol style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>1️⃣ Browse Services – Explore our range of beauty and grooming options.</li>
                <li>2️⃣ Choose Your Stylist – Hand-picked, verified professionals you can trust.</li>
                <li>3️⃣ Book in Seconds – Pick a time and place that works for you.</li>
                <li>4️⃣ Relax & Enjoy – We'll take care of the rest.</li>
            </ol>

            <div style="text-align: center; margin: 2rem 0;">
                <a href="{{ url('/dashboard') }}" class="btn btn-primary" style="color: white;">Book Now</a>
            </div>
        @endif
    </div>

    <div class="alert alert-info">
        <strong>💡 Tip:</strong>
        @if($userType === 'stylist')
            Verified profiles get priority visibility and more client bookings. Complete your setup today to start earning.
        @else
            Book your first appointment today and experience the Snipfair difference.
        @endif
    </div>

    <div class="content-section">
        <h3 style="color: #1f2937; margin-bottom: 1rem;">Why Snipfair?</h3>
        @if($userType === 'stylist')
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>We connect you with ready-to-book clients</li>
                <li>You keep control of your time and prices</li>
                <li>Secure payments and easy booking management</li>
            </ul>
        @else
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Pre-vetted beauty pros for quality and safety</li>
                <li>At-home, office, or on-location services</li>
                <li>Transparent pricing – no surprises</li>
            </ul>
        @endif
    </div>

    <div class="content-section">
        @if($userType === 'stylist')
            <p>Let's make beauty happen,</p>
        @else
            <p>We're so excited to have you with us,</p>
            <p>Have questions or need support? Contact us anytime at support@snipfair.com.</p>
        @endif

        <p style="margin-top: 2rem;">
            <strong>The Snipfair Team</strong>
        </p>
    </div>

    @if($bannerImage)
        <div style="text-align: center; margin: 1.5rem 0;">
            <img src="{{ $bannerImage }}" alt="Welcome Banner" style="max-width: 100%; height: auto; border-radius: 8px;">
        </div>
    @endif
@endsection

@extends('emails.layout')

@section('content')
    <div class="greeting">
        Hi, {{ $stylistName }}! 🎉
    </div>

    <div class="content-section">
        <p>Thank you for taking the time to apply to join {{ config('app.name') }} as a stylist.</p>

        <p>We truly appreciate your interest and the effort you put into your application.</p>
    </div>

    <div class="content-section">
        <p>After reviewing your submission, we’re unable to approve your business at this time. This decision may be due to missing information, verification issues, or not fully meeting our current onboarding requirements.</p>
        <p>You’re welcome to review your application details and update your profile adequetly to ensure automatic re-application. We value your passion for styling and hope to see your application again soon.</p>
    </div>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ url('/stylist/profile') }}" class="btn btn-primary btn-block">Log In to Update Profile</a>
    </div>

    <div class="content-section">
        <p><strong>We're here to help if you will like feedback or clarification on what to improve</strong></p>
        <p>Have questions or need support? Contact us anytime at <a href="mailto:support@snipfair.com" style="color: #9333EA;">support@snipfair.com</a>.</p>

        <p style="margin-top: 2rem;">
            Let's make beauty happen,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

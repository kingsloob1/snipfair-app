@extends('emails.layout')

@section('content')
    <div class="greeting">
        Congratulations, {{ $stylist->name }}! 🎉
    </div>

    @if($isApproval)
        <div class="content-section">
            <p>Your payment method has been approved and you're now ready to start earning through Snipfair!</p>
        </div>

        <div class="alert alert-success">
            <strong>✅ Payment Method Approved:</strong> You can now receive payments for your services
        </div>

        <div class="content-section">
            <p><strong>What you can do now:</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Accept appointment bookings from customers</li>
                <li>Receive payments directly to your approved account</li>
                <li>Request withdrawals of your earnings</li>
                <li>Track all your transactions and earnings</li>
                <li>Build your client base and grow your business</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/stylist/dashboard') }}" class="btn btn-primary" style="color: white;">Start Earning</a>
        </div>

        <div class="content-section">
            <p><strong>Getting Started Tips:</strong></p>
            <div style="background-color: #f8fafc; border-left: 4px solid #9333EA; padding: 1rem; margin: 1rem 0;">
                <ul style="margin: 0; padding-left: 1rem; color: #4b5563;">
                    <li>Complete your profile with high-quality photos</li>
                    <li>Set competitive pricing for your services</li>
                    <li>Respond quickly to booking requests</li>
                    <li>Provide excellent customer service</li>
                    <li>Ask satisfied customers for reviews</li>
                </ul>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>💰 Earnings Info:</strong> Payments are processed after service completion and will be available for withdrawal within 24 hours.
        </div>

    @else
        <div class="content-section">
            <p>Your premium subscription has been activated! Welcome to Snipfair Premium.</p>
        </div>

        <div class="alert alert-success">
            <strong>✅ Premium Subscription Activated</strong>
            @if($subscription)
                <br>Plan: {{ $subscription->plan_name ?? 'Premium' }}
                @if($subscription->expires_at)
                    <br>Valid until: {{ \Carbon\Carbon::parse($subscription->expires_at)->format('F j, Y') }}
                @endif
            @endif
        </div>

        <div class="content-section">
            <p><strong>Premium Features Now Available:</strong></p>
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Priority listing in search results</li>
                <li>Advanced analytics and insights</li>
                <li>Multiple portfolio showcases</li>
                <li>Custom availability settings</li>
                <li>Lower platform fees on transactions</li>
                <li>Priority customer support</li>
                <li>Marketing tools and promotions</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="{{ url('/stylist/premium') }}" class="btn btn-primary" style="color: white;">Explore Premium Features</a>
        </div>

        <div class="content-section">
            <p><strong>Maximize Your Premium Benefits:</strong></p>
            <div style="background-color: #f8fafc; border-left: 4px solid #9333EA; padding: 1rem; margin: 1rem 0;">
                <ul style="margin: 0; padding-left: 1rem; color: #4b5563;">
                    <li>Update your portfolio with new work</li>
                    <li>Use analytics to optimize your pricing</li>
                    <li>Set up promotional campaigns</li>
                    <li>Customize your availability for peak times</li>
                    <li>Take advantage of marketing tools</li>
                </ul>
            </div>
        </div>

        @if($subscription && $subscription->expires_at)
        <div class="alert alert-warning">
            <strong>🔄 Auto-Renewal:</strong> Your subscription will automatically renew on {{ \Carbon\Carbon::parse($subscription->expires_at)->format('F j, Y') }}. You can manage this in your account settings.
        </div>
        @endif
    @endif

    <div class="content-section">
        <p><strong>Next Steps:</strong></p>
        <table class="table">
            <tr>
                <td style="width: 50px;">✅</td>
                <td>Complete your profile setup</td>
            </tr>
            <tr>
                <td>📸</td>
                <td>Upload high-quality portfolio images</td>
            </tr>
            <tr>
                <td>💰</td>
                <td>Set your service pricing</td>
            </tr>
            <tr>
                <td>📅</td>
                <td>Configure your availability</td>
            </tr>
            <tr>
                <td>🎯</td>
                <td>Start accepting bookings</td>
            </tr>
        </table>
    </div>

    <div class="content-section">
        <p>
            @if($isApproval)
                You're all set to start your journey as a professional stylist on Snipfair. We're here to support your success!
            @else
                Enjoy all the premium features and take your stylist business to the next level!
            @endif
        </p>

        <p style="margin-top: 2rem;">
            Best regards,<br>
            <strong>The Snipfair Team</strong>
        </p>
    </div>
@endsection

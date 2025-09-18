@extends('emails.layout', ['isAdmin' => true])

@section('content')
    <div class="greeting">
        Welcome to Snipfair Administration
    </div>

    <div class="content-section">
        <p>Hello,</p>
        
        <p>An administrator account has been created for you on the Snipfair platform. You have been granted <strong>{{ ucwords(str_replace('-', ' ', $admin->role)) }}</strong> access to the administrative dashboard.</p>
    </div>

    <div class="content-section">
        <h3 style="color: #1f2937; margin-bottom: 1rem;">Your Login Credentials</h3>
        <div class="table">
            <table>
                <tr>
                    <td style="font-weight: 600;">Email:</td>
                    <td>{{ $admin->email }}</td>
                </tr>
                <tr>
                    <td style="font-weight: 600;">Temporary Password:</td>
                    <td style="font-family: 'Monaco', 'Consolas', monospace; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">{{ $temporaryPassword }}</td>
                </tr>
                <tr>
                    <td style="font-weight: 600;">Role:</td>
                    <td>{{ ucwords(str_replace('-', ' ', $admin->role)) }}</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="content-section">
        <h3 style="color: #1f2937; margin-bottom: 1rem;">Your Role Permissions</h3>
        
        @if($admin->role === 'super-admin')
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Full system administration access</li>
                <li>Manage all administrators and their roles</li>
                <li>Access all reports and analytics</li>
                <li>System configuration and settings</li>
                <li>User management (customers and stylists)</li>
                <li>Financial reporting and payment oversight</li>
            </ul>
        @elseif($admin->role === 'moderator')
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Manage support administrators and editors</li>
                <li>Review and moderate content</li>
                <li>Handle customer and stylist disputes</li>
                <li>Access to user management tools</li>
                <li>View reports and analytics</li>
            </ul>
        @elseif($admin->role === 'support-admin')
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Manage editor accounts</li>
                <li>Handle customer support tickets</li>
                <li>Assist with appointment issues</li>
                <li>Access to user support tools</li>
                <li>Basic reporting access</li>
            </ul>
        @elseif($admin->role === 'editor')
            <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
                <li>Content management and editing</li>
                <li>Basic customer support</li>
                <li>Limited user profile management</li>
                <li>View basic reports</li>
            </ul>
        @endif
    </div>

    <div class="alert alert-warning">
        <strong>⚠️ Important Security Notice:</strong>
        <p style="margin-top: 0.5rem;">Please change your password immediately after your first login. The temporary password above should only be used for your initial sign-in.</p>
    </div>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="{{ $loginUrl }}" class="btn btn-primary" style="color: white;">Login to Admin Dashboard</a>
    </div>

    <div class="content-section">
        <h3 style="color: #1f2937; margin-bottom: 1rem;">Getting Started</h3>
        <ol style="margin: 1rem 0; padding-left: 1.5rem; color: #4b5563;">
            <li>Click the "Login to Admin Dashboard" button above</li>
            <li>Use your email and the temporary password provided</li>
            <li>Change your password in the profile settings</li>
            <li>Complete your profile information</li>
            <li>Familiarize yourself with the admin dashboard</li>
        </ol>
    </div>

    <div class="content-section">
        <p>If you have any questions about your account or need assistance accessing the system, please contact your administrator or reach out to our technical support team.</p>
        
        <p style="margin-top: 2rem;">
            <strong>Snipfair Administration Team</strong>
        </p>
    </div>

    <div class="alert alert-info">
        <strong>📞 Need Help?</strong>
        <p style="margin-top: 0.5rem;">Contact technical support at admin@snipfair.com if you encounter any issues accessing your account.</p>
    </div>
@endsection

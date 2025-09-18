<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset - Snipfair Administration</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }
        .password-box {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .password {
            font-size: 24px;
            font-weight: bold;
            color: #495057;
            font-family: 'Courier New', monospace;
            background: #ffffff;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #ced4da;
            display: inline-block;
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Password Reset</h1>
        <p>Snipfair Administration Panel</p>
    </div>

    <div class="content">
        <h2>Hello {{ $admin->name }},</h2>

        <p>Your administrator password has been reset by a super administrator. Please use the temporary password below to log in to the admin panel:</p>

        <div class="password-box">
            <p><strong>Your New Temporary Password:</strong></p>
            <div class="password">{{ $newPassword }}</div>
        </div>

        <div class="warning">
            <strong>Important Security Notice:</strong>
            <ul>
                <li>This is a temporary password generated for your account</li>
                <li>Please change this password immediately after logging in</li>
                <li>Do not share this password with anyone</li>
                <li>This email contains sensitive information - please delete it after use</li>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="{{ $loginUrl }}" class="button" style="color: white;">Login to Admin Panel</a>
        </div>

        <p>If you did not expect this password reset, please contact your system administrator immediately.</p>

        <p>
            Best regards,<br>
            <strong>Snipfair Administration Team</strong>
        </p>
    </div>

    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; {{ date('Y') }} Snipfair. All rights reserved.</p>
    </div>
</body>
</html>

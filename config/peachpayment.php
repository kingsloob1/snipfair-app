<?php

return [
    'merchant_id' => env('PEACH_PAYMENT_MERCHANT_ID', '73169fe3fa984d63bb7047a6a9df46cc'),
    'client_id' => env('PEACH_PAYMENT_CLIENT_ID', '045ff043b228e1725d89b93504174f'),
    'client_secret' => env('PEACH_PAYMENT_CLIENT_SECRET', 'NuQrRH50a9qby2bjoqNBFv+mmBbESsvX/rdKcoIA1Pxh3T72SULZrxkuAe1jz0nJSlbpgGLE5VIjszfpYlHasw=='),
    'auth_endpoint' => env('PEACH_PAYMENT_AUTH_ENDPOINT', 'https://sandbox-dashboard.peachpayments.com'),
    'payout_endpoint' => env('PEACH_PAYMENT_PAYOUT_ENDPOINT', 'https://sandbox-payouts.peachpayments.com'),
    'test_mode' => (bool) env('PEACH_PAYMENT_TEST_MODE', true)
];

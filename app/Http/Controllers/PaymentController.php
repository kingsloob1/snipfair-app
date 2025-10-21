<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPayfastDeposit;
use App\Mail\DepositNotificationEmail;
use App\Mail\WithdrawalConfirmationEmail;
use App\Mail\WithdrawalNotificationEmail;
use App\Mail\WithdrawalRejectedEmail;
use App\Models\AdminPaymentMethod;
use App\Models\AppointmentPouch;
use App\Models\Deposit;
use App\Models\StylistPaymentMethod;
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use App\Models\Transaction;  // Your Transaction model
use App\Models\User;
use App\Models\Withdrawal;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Str;

class PaymentController extends Controller
{
    public function getBanks()
    {
        return [
            // Major/Commercial Banks
            ["name" => 'Absa Bank', "branchCode" => '632005', 'is_supported_by_peach_payments' => true],
            ["name" => 'Access Bank', "branchCode" => '410506', 'is_supported_by_peach_payments' => true],
            ["name" => 'African Bank', "branchCode" => '430000', 'is_supported_by_peach_payments' => true],
            ["name" => 'African Bank Business', "branchCode" => '430000', 'is_supported_by_peach_payments' => true],
            ["name" => 'Albaraka Bank', "branchCode" => '800000', 'is_supported_by_peach_payments' => true],
            ["name" => 'Bidvest Bank', "branchCode" => '462005', 'is_supported_by_peach_payments' => true],
            ["name" => 'Capitec Bank', "branchCode" => '470010', 'is_supported_by_peach_payments' => true],
            ["name" => 'Capitec Business', "branchCode" => '450105', 'is_supported_by_peach_payments' => true],
            ["name" => 'Discovery Bank', "branchCode" => '679000', 'is_supported_by_peach_payments' => true],
            ["name" => 'FirstRand Bank (FNB)', "branchCode" => '250655', 'is_supported_by_peach_payments' => true],
            ["name" => 'First National Bank (FNB)', "branchCode" => '250655', 'is_supported_by_peach_payments' => true],
            ["name" => 'Rand Merchant Bank (RMB)', "branchCode" => '250655', 'is_supported_by_peach_payments' => true],
            ["name" => 'Investec Bank', "branchCode" => '580105', 'is_supported_by_peach_payments' => true],
            ["name" => 'Nedbank', "branchCode" => '198765', 'is_supported_by_peach_payments' => true],
            ["name" => 'Old Mutual Bank', "branchCode" => '462105', 'is_supported_by_peach_payments' => true],
            ["name" => 'Sasfin Bank', "branchCode" => '683000', 'is_supported_by_peach_payments' => true],
            ["name" => 'Standard Bank', "branchCode" => '051001', 'is_supported_by_peach_payments' => true],
            ["name" => 'TymeBank', "branchCode" => '678910', 'is_supported_by_peach_payments' => true],
            ["name" => 'Ubank', "branchCode" => '431010', 'is_supported_by_peach_payments' => true],
            ["name" => 'Grindrod Bank', "branchCode" => '584000', 'is_supported_by_peach_payments' => false],

            // Foreign Banks/Local Branches
            ["name" => 'Access Bank South Africa', "branchCode" => '410105', 'is_supported_by_peach_payments' => false],
            ["name" => 'Bank of China', "branchCode" => '431000', 'is_supported_by_peach_payments' => false],
            ["name" => 'Citibank', "branchCode" => '350000', 'is_supported_by_peach_payments' => false],
            ["name" => 'HBZ Bank (Habib Bank AG Zurich)', "branchCode" => '570105', 'is_supported_by_peach_payments' => true],
            ["name" => 'ICBC', "branchCode" => '495000', 'is_supported_by_peach_payments' => false],
            ["name" => 'Société Générale', "branchCode" => '306009', 'is_supported_by_peach_payments' => false],
            [
                "name" => 'China Construction Bank Johannesburg Branch',
                "branchCode" => null,
                'is_supported_by_peach_payments' => false
            ],
            ["name" => 'Bank of Taiwan South Africa Branch', "branchCode" => null],
            [
                "name" => 'JPMorgan Chase Bank, N.A., Johannesburg Branch',
                "branchCode" => '432000',
                'is_supported_by_peach_payments' => false
            ],
            [
                "name" => 'Standard Chartered Bank Johannesburg Branch',
                "branchCode" => '730000',
                'is_supported_by_peach_payments' => false
            ],
            [
                "name" => 'HSBC Bank plc - Johannesburg Branch',
                "branchCode" => '587000',
                'is_supported_by_peach_payments' => false
            ],
            [
                "name" => 'State Bank of India South Africa Branch',
                "branchCode" => '801000',
                'is_supported_by_peach_payments' => false
            ],

            // Mutual Banks
            ["name" => 'Bank Zero Mutual Bank', "branchCode" => '888000', 'is_supported_by_peach_payments' => true],
            ["name" => 'Finbond Mutual Bank', "branchCode" => '589000', 'is_supported_by_peach_payments' => true],
            ["name" => 'Finbond EPE', "branchCode" => '589000', 'is_supported_by_peach_payments' => true],
            ["name" => 'GBS Mutual Bank', "branchCode" => null, 'is_supported_by_peach_payments' => false],
            ["name" => 'YWBN Mutual Bank', "branchCode" => null, 'is_supported_by_peach_payments' => false],

            // Co-operative Banks
            ["name" => 'Ditsobotla Primary Co-operative Bank', "branchCode" => null, 'is_supported_by_peach_payments' => false],
            ["name" => 'GIG Co-operative Bank', "branchCode" => null, 'is_supported_by_peach_payments' => false],
            ["name" => 'KSK Koöperatiewe Bank', "branchCode" => null, 'is_supported_by_peach_payments' => false],
            ["name" => 'OSK Koöperatiewe Bank', "branchCode" => null, 'is_supported_by_peach_payments' => false],
            ["name" => 'Ziphakamise Co-operative Bank', "branchCode" => null, 'is_supported_by_peach_payments' => false],
        ];
    }

    public function bankList(Request $request)
    {
        return response()->json($this->getBanks());
    }

    public function getFundingMethods(Request $request)
    {
        $fundingMethods = AdminPaymentMethod::query()
            ->where('is_active', true)
            ->get();

        if ($fundingMethods->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No funding method available',
            ], 404);
        }

        return $fundingMethods;
    }

    public function initiatePayfastTxn(Request $request)
    {
        $user = $request->user();
        $payment_method = AdminPaymentMethod::where('bank_name', 'Payfast')->where('is_active', '=', true)->first();

        if (!$payment_method) {
            return response()->json([
                'status' => 'false',
                'message' => 'Payfast payment method is currently not available'
            ], 400);
        }

        $validated = $request->validate([
            'type' => 'required|in:deposit,topup,subscription',
            'amount' => 'required|numeric|gt:0',
            'email' => 'sometimes|email',
            'first_name' => 'sometimes|string',
            'last_name' => 'sometimes|string',
            'portfolio_id' => [
                'required_if:type,deposit',
                'exists:portfolios,id'
            ]
        ]);

        switch ($validated['type']) {
            case 'topup': {
                try {
                    // Generate unique reference
                    $reference = 'WALLET-TOPUP-' . time();

                    // Create transaction record
                    $transaction = Transaction::create([
                        'user_id' => $user->id,
                        'amount' => $request->amount,
                        'type' => 'topup',
                        'status' => 'pending',
                        'ref' => $reference,
                        'description' => 'Wallet top-up via ' . $payment_method->bank_name,
                    ]);

                    $deposit = Deposit::create([
                        'user_id' => $user->id,
                        'amount' => $request->amount,
                        'transaction_id' => $transaction->id,
                        'admin_payment_method_id' => $payment_method->id,
                        'status' => 'pending',
                    ]);

                    defer(function () use ($user, $deposit) {
                        Mail::to('admin@snipfair.com')->send(new DepositNotificationEmail(
                            deposit: $deposit,
                            user: $user,
                            recipientType: 'admin'
                        ));
                        Mail::to($user->email)->send(new DepositNotificationEmail(
                            deposit: $deposit,
                            user: $user,
                            recipientType: 'customer'
                        ));
                    });

                    $m_payment_id = (string) $transaction->id;
                } catch (\Exception $e) {
                    Log::info('Topup error: ' . $e->getMessage());
                    return response()->json([
                        'status' => false,
                        'message' => 'Top-up failed. Please try again.'
                    ], 400);
                }

                break;
            }

            case 'deposit': {
                try {
                    $deposit = Deposit::create([
                        'user_id' => $user->id,
                        'amount' => $request->amount,
                        'portfolio_id' => $request->portfolio_id,
                        'admin_payment_method_id' => $payment_method->id,
                        'status' => 'pending',
                    ]);
                    $deposit->load('payment_method');


                    defer(function () use ($user, $deposit) {
                        Mail::to('admin@snipfair.com')->send(new DepositNotificationEmail(
                            deposit: $deposit,
                            user: $user,
                            recipientType: 'admin'
                        ));
                        Mail::to($user->email)->send(new DepositNotificationEmail(
                            deposit: $deposit,
                            user: $user,
                            recipientType: 'customer'
                        ));
                    });

                    $m_payment_id = (string) $request->portfolio_id;
                } catch (\Exception $e) {
                    Log::info('Deposit error: ' . $e->getMessage());
                    return response()->json([
                        'status' => false,
                        'message' => 'Deposit failed. Please check your billing details and try again, or contact support if issue persists.'
                    ], 400);
                }

                break;
            }

            default: {
                return response()->json([
                    'status' => false,
                    'message' => 'Transaction type is currently not supported'
                ], 400);
            }
        }

        // Prepare Payfast data
        $data = [
            'merchant_id' => config('payfast.merchant_id'),
            'merchant_key' => config('payfast.merchant_key'),
            'return_url' => URL::to("/api/payment/success/payfast?deposit_id={$deposit->id}"), // Optional if using callback
            'cancel_url' => URL::to("/api/payment/cancel/payfast?deposit_id={$deposit->id}"), // Optional if using callback
            'notify_url' => URL::to('/api/payment/webhook/payfast'), // Webhook endpoint
            'name_first' => $validated['first_name'] ?? $user->first_name ?? 'Snipfair',
            'name_last' => $validated['last_name'] ?? $user->last_name ?? 'Customer',
            'email_address' => $validated['email'] ?? $user->first_name,
            'm_payment_id' => (string) $m_payment_id ?? '0',
            'amount' => number_format((float) $validated['amount'], 2, '.', ''),
            'item_name' => $deposit ? $deposit->id : '0',
        ];

        // Generate signature
        $data['signature'] = $this->generatePayfastSignature($data, config('payfast.passphrase'));

        // Convert to param string
        $paramString = http_build_query($data);

        // Endpoint
        $endpoint = config('payfast.test_mode')
            ? 'https://sandbox.payfast.co.za/onsite/process'
            : 'https://www.payfast.co.za/onsite/process';

        // Send request
        $client = new Client();
        try {
            $response = $client->post($endpoint, [
                'body' => $paramString,
                'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
            ]);

            $body = json_decode((string) $response->getBody(), true);
            if (Arr::has($body, 'uuid')) {
                $inSandbox = (bool) config('payfast.test_mode');

                $query = http_build_query([
                    'uuid' => $body['uuid'],
                    'deposit_id' => $deposit->id,
                    'in_sandbox' => $inSandbox,
                    'amount' => $deposit->amount,
                ]);

                return response()->json([
                    'status' => true,
                    'payfast_uuid' => $body['uuid'],
                    'deposit_id' => $deposit->id,
                    'in_sandbox' => $inSandbox,
                    'amount' => $deposit->amount,
                    'payment_url' => URL::to("/api/payment/pay/payfast") . "?{$query}",
                    'success_url' => URL::to("/api/payment/success/payfast") . "?{$query}",
                    'cancel_url' => URL::to("/api/payment/cancel/payfast") . "?{$query}",
                    'notify_url' => URL::to('/api/payment/webhook/payfast')
                ]);
            } else {
                Log::error('Payfast transaction initialization failed', $response);
                return response()->json([
                    'status' => false,
                    'message' => 'Transaction failed. Please try again.'
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Payfast initiation error: ' . $e->getMessage());
            if ($transaction) {
                $transaction->update(['status' => 'failed']);
            }

            if ($deposit) {
                $deposit->update(['status' => 'declined']);
            }

            return response()->json([
                'status' => false,
                'message' => 'Payment initiation failed. Please try again later.'
            ], 400);
        }
    }

    public function displayPayfastPage(Request $request)
    {
        $isInSandbox = $request->query('in_sandbox') ? (bool) $request->query('in_sandbox') : (bool) config('payfast.test_mode');
        $uuid = $request->query('uuid');
        $amount = (float) $request->query('amount');
        $depositId = $request->query('deposit_id');

        return view('payfast-pay', [
            'in_sandbox' => $isInSandbox,
            'uuid' => $uuid,
            'amount' => $amount,
            'deposit_id' => $depositId
        ]);
    }

    public function handleCancelPayfastTxn(Request $request)
    {
        $deposit = Deposit::query()
            ->with(['transaction'])
            ->find($request->deposit_id);

        $transaction = $deposit->transaction;
        if ($transaction) {
            $transaction->update(['status' => 'failed']);
        }

        if ($deposit) {
            $deposit->update(['status' => 'declined']);
        }

        return response()->noContent();
    }

    public function handleSuccessfulPayfastTxn(Request $request)
    {
        //To-DO Write logic to handle successful payfast txn
        return response()->noContent();
    }

    public function getUserWallet(Request $request)
    {
        $user = $request->user();

        // Get wallet balance (current user balance)
        $walletBalance = (float) $user->balance ?? 0;

        // Get wallet transactions (topup, refund, payment)
        $transactions = Transaction::where('user_id', $user->id)
            ->whereIn('type', ['topup', 'refund', 'payment'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'amount' => (float) $transaction->amount,
                    'description' => $transaction->description ?? ucfirst($transaction->type) . ' transaction',
                    'status' => $transaction->status,
                    'reference' => $transaction->ref,
                    'created_at' => $transaction->created_at->toISOString(),
                    'updated_at' => $transaction->updated_at->toISOString(),
                ];
            });

        // Calculate wallet stats
        $totalTopups = Transaction::where('user_id', $user->id)
            ->where('type', 'topup')
            ->where('status', 'completed')
            ->sum('amount');

        $totalRefunds = Transaction::where('user_id', $user->id)
            ->where('type', 'refund')
            ->where('status', 'reversed')
            ->sum('amount');

        $pendingTransactionCount = Transaction::where('user_id', $user->id)
            ->whereIn('type', ['topup', 'refund', 'payment'])
            ->whereIn('status', ['pending', 'processing'])
            ->count();

        $pendingAmount = (float) AppointmentPouch::where('user_id', $user->id)
            ->where('status', 'holding')
            ->sum('amount');

        $walletStats = [
            'currentBalance' => (float) $walletBalance,
            'totalTopups' => (float) $totalTopups,
            'totalRefunds' => (float) $totalRefunds,
            'pendingTransactions' => $pendingTransactionCount,
        ];

        return [
            'balance' => $walletBalance,
            'escrow_balance' => (float) $pendingAmount,
            'stats' => $walletStats,
        ];
    }

    public function getUserTransactions(Request $request)
    {
        $perPage = formatPerPage($request);
        $user = $request->user();

        $transactions = Transaction::where('user_id', $user->id)
            ->whereIn('type', ['topup', 'refund', 'payment'])
            ->orderBy('created_at', 'desc')
            ->cursorPaginate($perPage, ['*'], 'page')
            ->through(function (Transaction $transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'amount' => (float) $transaction->amount,
                    'description' => $transaction->description ?? ucfirst($transaction->type) . ' transaction',
                    'status' => $transaction->status,
                    'reference' => $transaction->ref,
                    'created_at' => $transaction->created_at->toISOString(),
                    'updated_at' => $transaction->updated_at->toISOString(),
                ];
            });

        return $transactions;
    }

    /**
     * Inertia implementations start
     */

    public function initiate(Request $request)
    {
        $user = $request->user();
        $payment_method = AdminPaymentMethod::where('bank_name', 'Payfast')->first();
        if (!$payment_method) {
            return back()->with('error', 'Payment method not available. Please contact support.');
        }
        $validated = $request->validate([
            'amount' => 'required|numeric|gt:0',
            'email' => 'required|email',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'type' => 'required|in:deposit,topup,subscription',
            'portfolio_id' => [
                'nullable',
                'required_if:type,deposit',
                'exists:portfolios,id'
            ]
        ]);

        if ($validated['type'] === 'topup') {
            try {
                // Generate unique reference
                $reference = 'WALLET-TOPUP-' . time();

                // Create transaction record
                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'amount' => $request->amount,
                    'type' => 'topup',
                    'status' => 'pending',
                    'ref' => $reference,
                    'description' => 'Wallet top-up via ' . $payment_method->bank_name,
                ]);

                $deposit = Deposit::create([
                    'user_id' => $user->id,
                    'amount' => $request->amount,
                    'transaction_id' => $transaction->id,
                    'admin_payment_method_id' => $payment_method->id,
                    'status' => 'pending',
                ]);
                Mail::to('admin@snipfair.com')->send(new DepositNotificationEmail(
                    deposit: $deposit,
                    user: $user,
                    recipientType: 'admin'
                ));
                Mail::to($user->email)->send(new DepositNotificationEmail(
                    deposit: $deposit,
                    user: $user,
                    recipientType: 'customer'
                ));
                $m_payment_id = (string) $transaction->id;
            } catch (\Exception $e) {
                return back()->with('error', 'Top-up failed. Please try again.');
            }
        } else if ($validated['type'] === 'deposit') {
            try {
                $deposit = Deposit::create([
                    'user_id' => $user->id,
                    'amount' => $request->amount,
                    'portfolio_id' => $request->portfolio_id,
                    'admin_payment_method_id' => $payment_method->id,
                    'status' => 'pending',
                ]);
                $deposit->load('payment_method');
                Mail::to('admin@snipfair.com')->send(new DepositNotificationEmail(
                    deposit: $deposit,
                    user: $user,
                    recipientType: 'admin'
                ));
                Mail::to($user->email)->send(new DepositNotificationEmail(
                    deposit: $deposit,
                    user: $user,
                    recipientType: 'customer'
                ));
                $m_payment_id = (string) $request->portfolio_id;
            } catch (\Exception $e) {
                Log::info('Deposit error: ' . $e->getMessage());
                return back()->with('error', 'Deposit failed. Please check your billing details and try again, or contact support if issue persists.');
            }
        } else {
            return back()->with('error', 'Transaction ran into an error. Please try again or contact support if issue persists.');
        }

        // Prepare Payfast data
        $data = [
            'merchant_id' => config('payfast.merchant_id'),
            'merchant_key' => config('payfast.merchant_key'),
            'return_url' => config('app.url') . '/payment/success', // Optional if using callback
            'cancel_url' => config('app.url') . '/payment/cancel',  // Optional if using callback
            'notify_url' => config('app.url') . '/api/payment/webhook', // Webhook endpoint
            'name_first' => $validated['first_name'] ?? 'Snipfair',
            'name_last' => $validated['last_name'] ?? 'Customer',
            'email_address' => $validated['email'],
            'm_payment_id' => (string) $m_payment_id ?? '0',
            'amount' => number_format((float) $validated['amount'], 2, '.', ''),
            'item_name' => $deposit ? $deposit->id : '0',
        ];

        // Generate signature
        $data['signature'] = $this->generatePayfastSignature($data, config('payfast.passphrase'));

        // Convert to param string
        $paramString = http_build_query($data);

        // Endpoint
        $endpoint = config('payfast.test_mode')
            ? 'https://sandbox.payfast.co.za/onsite/process'
            : 'https://www.payfast.co.za/onsite/process';

        // Send request
        $client = new Client();
        try {
            $response = $client->post($endpoint, [
                'body' => $paramString,
                'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
            ]);

            $body = json_decode((string) $response->getBody(), true);
            if (isset($body['uuid'])) {
                return back()->with([
                    'message' => 'Payment initiation started!',
                    'custom_response' => [
                        'uuid' => $body['uuid'],
                        'deposit_id' => $deposit->id,
                    ],
                ]);
            } else {
                return back()->with('error', 'Transaction failed. Please try again.');
            }
        } catch (\Exception $e) {
            Log::error('Payfast initiation error: ' . $e->getMessage());
            if ($transaction)
                $transaction->update(['status' => 'failed']);
            if ($deposit)
                $deposit->update(['status' => 'declined']);
            return back()->with('error', 'Payment initiation failed. Please try again later.');
        }
    }

    public function cancelDeposit(Request $request)
    {
        $deposit = Deposit::find($request->deposit_id);
        $transaction = $deposit->transaction;
        if ($transaction)
            $transaction->update(['status' => 'failed']);
        if ($deposit)
            $deposit->update(['status' => 'declined']);
        return back();
    }

    private function getPeachPaymentAuthToken()
    {
        $cacheKey = 'peach:payment:token';
        $authToken = Cache::get($cacheKey, null);

        if (!$authToken) {
            $merchantId = config('peachpayment.merchant_id');
            $clientId = config('peachpayment.client_id');
            $clientSecret = config('peachpayment.client_secret');
            $authEndpoint = config('peachpayment.auth_endpoint');

            $startTime = Carbon::now();
            $responseJson = Http::connectTimeout(30)->timeout(120)->retry(5, 500)->dontTruncateExceptions()->post("{$authEndpoint}/api/oauth/token", [
                'clientId' => $clientId,
                'clientSecret' => $clientSecret,
                'merchantId' => $merchantId
            ])->throw()->json();

            $token = Arr::get($responseJson, 'access_token', null);
            $expiresInSeconds = (int) Arr::get($responseJson, 'expires_in', 0);
            $tokenType = Arr::get($responseJson, 'token_type', 'Bearer');
            $authToken = "{$tokenType} {$token}";

            $reqSeconds = (int) Carbon::now()->diffInSeconds($startTime);
            Cache::put($cacheKey, $authToken, $expiresInSeconds - ($reqSeconds + 5));
        }

        return $authToken;
    }

    private function getPeachPaymentPayoutHttpClient()
    {
        $merchantId = config('peachpayment.merchant_id');
        return Http::connectTimeout(30)->timeout(120)->baseUrl(config('peachpayment.payout_endpoint') . "/api/merchants/{$merchantId}")->withHeader('Authorization', $this->getPeachPaymentAuthToken())->dontTruncateExceptions();
    }

    private function getPeachPaymentBalanceResp()
    {
        $cacheKey = 'peach:payment:balance';
        return Cache::remember($cacheKey, 10, function () {
            $responseJson = $this->getPeachPaymentPayoutHttpClient()->get("balance")->throw()->json();

            $availableBalance = (float) Arr::get($responseJson, 'availableBalance', 0);
            $currency = (float) Arr::get($responseJson, 'currency', 'ZAR');
            $lastTransactionDate = Carbon::parse(Arr::get($responseJson, 'lastTransactionDate', Carbon::now()));

            return [
                'balance' => $availableBalance / 100,
                'currency' => $currency,
                'lastTransactionDate' => $lastTransactionDate
            ];
        });
    }

    private function withdrawFromPeachPayment(Withdrawal $withdrawal, StylistPaymentMethod $paymentMethod, User $user)
    {
        $amount = (float) $withdrawal->amount;
        $uuidV4 = \Illuminate\Support\Str::uuid()->toString();
        $refWithoutPeachPayoutId = 'WDR-' . $withdrawal->id;
        $refWithPeachPayoutId = $refWithoutPeachPayoutId . '-PEACHPAYOUTID-' . $uuidV4;
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'type' => 'withdraw',
            'status' => 'pending',
            'ref' => $refWithPeachPayoutId,
            'description' => 'Withdrawal request',
        ]);

        $peachPaymentBalanceResp = $this->getPeachPaymentBalanceResp();
        $balance = $peachPaymentBalanceResp['balance'];
        $foundBank = Arr::first($this->getBanks(), function ($bank) use ($paymentMethod) {
            return ($bank['branchCode'] === $paymentMethod->routing_number) && !!$bank['is_supported_by_peach_payments'];
        });

        if (($amount > $balance) || !$foundBank) {
            $transaction->update([
                'ref' => $refWithoutPeachPayoutId,
            ]);

            return $transaction;
        }

        try {
            $response = $this->getPeachPaymentPayoutHttpClient()->post("payouts", [
                'payouts' => [
                    [
                        'payoutId' => $uuidV4,
                        'currency' => $peachPaymentBalanceResp['currency'],
                        'amount' => round($amount * 1000),
                        'accountNumber' => $paymentMethod->account_number,
                        'branchCode' => $foundBank['branchCode'],
                        'reference' => $transaction->ref,
                        'bankName' => $foundBank['name'],
                        'accountHolder' => $paymentMethod->account_name,
                        'payoutMethod' => 'realtime-eft'
                    ]
                ]
            ])->throw();

            $responseJson = $response->json();
            $payoutRequestId = Arr::get($responseJson, 'payoutRequestId');

            if ($response->successful() && $payoutRequestId) {
                $transaction->update([
                    'status' => 'processing',
                    'processor' => 'peachpayments',
                    'processor_id' => $uuidV4,
                ]);

                $withdrawal->update([
                    'status' => 'processing',
                    'processor' => 'peachpayments',
                    'processor_id' => $payoutRequestId
                ]);

                $transactionResp = $this->processPeachPaymentPayout($withdrawal, $transaction, $responseJson);

                if ($transactionResp) {
                    $transaction = $transactionResp;
                }
            }
        } catch (HttpClientException $e) {
            $transaction->update([
                'ref' => $refWithoutPeachPayoutId,
            ]);
        }

        return $transaction;
    }

    /**
     * Summary of processPeachPaymentPayout
     * @param \App\Models\Withdrawal $withdrawal
     * @param Transaction|null $transaction
     * @param array|null $peachPaymentRespData
     */
    public function processPeachPaymentPayout(Withdrawal $withdrawal, $transaction = null, $peachPaymentRespData = null)
    {
        $refStartsWith = "WDR-{$withdrawal->id}-PEACHPAYOUTID-";
        $transaction = $transaction ?? Transaction::query()
            ->whereLike('ref', "{$refStartsWith}%")
            ->where('type', '=', 'withdraw')
            ->where('amount', '=', $withdrawal->amount)
            ->where('processor', '=', 'peachpayments')
            ->first();

        if (!($transaction && $withdrawal->processor === 'peachpayments' && $withdrawal->processor_id)) {
            return null;
        }

        if ($withdrawal->status !== 'processing') {
            Log::warning("Processing peach payment withdrawal for {$withdrawal->id} status is not processing. Instead it is {$withdrawal->status}");

            return $transaction;
        }

        $peachPaymentPayoutId = $withdrawal->processor_id;

        try {
            $responseJson = $peachPaymentRespData ?? $this->getPeachPaymentPayoutHttpClient()->get("payouts/{$peachPaymentPayoutId}/status")->throw()->json();

            $payoutData = Arr::get($responseJson, 'payouts[0]');
            Log::info($responseJson);

            if (!$payoutData) {
                Log::warning("No matching payout for peach payment withdrawal for {$withdrawal->id}");
                return $transaction;
            }

            $payoutStatus = $payoutData['status'];

            switch ($payoutStatus) {
                case 'pending':
                case 'processing': {
                    Log::warning("Peach payment payout for withdrawal {$withdrawal->id} has status {$payoutStatus}");
                    return $transaction;
                }

                case 'successful': {
                    Log::info("Peach payment payout for withdrawal {$withdrawal->id} was successful");
                    $withdrawal->update([
                        'status' => 'approved'
                    ]);
                    $transaction->update([
                        'status' => 'completed'
                    ]);

                    defer(function () use ($withdrawal) {
                        Mail::to($withdrawal->user->email)->send(new WithdrawalConfirmationEmail(
                            withdrawal: $withdrawal,
                            stylist: $withdrawal->user,
                        ));
                        sendNotification(
                            $withdrawal->user->id,
                            route('stylist.earnings'),
                            'Withdrawal Approved Successfully',
                            'Your withdrawal of R' . $withdrawal->amount . ' has been approved successfully, and you would receive it in your account shortly.',
                            'normal',
                        );
                    });

                    return $transaction;
                }

                case 'reversed':
                case 'failed': {
                    Log::warning("Peach payment payout for withdrawal {$withdrawal->id} failed with status {$payoutStatus}");
                    $withdrawal->update([
                        'status' => 'declined'
                    ]);
                    $transaction->update([
                        'status' => 'failed'
                    ]);

                    // Refund amount to user balance
                    User::query()
                        ->where('id', '=', $withdrawal->user_id)
                        ->update(['balance' => DB::raw("balance + {$withdrawal->amount}")]);

                    defer(function () use ($withdrawal) {
                        Mail::to($withdrawal->user->email)->send(new WithdrawalRejectedEmail(
                            withdrawal: $withdrawal,
                            stylist: $withdrawal->user,
                        ));
                        sendNotification(
                            $withdrawal->user->id,
                            route('stylist.earnings'),
                            'Withdrawal Rejected',
                            'Your withdrawal of R' . $withdrawal->amount . ' has been rejected, and the amount has been refunded to your wallet.',
                            'normal',
                        );
                    });

                    return $transaction;
                }

                default: {
                    Log::warning("Peach payment payout for withdrawal {$withdrawal->id} does not handle the following payout status {$payoutStatus}");
                    return $transaction;
                }
            }
        } catch (HttpClientException $e) {
            Log::error($e);
            Log::error("An error occurred while processing peach payment withdrawal for {$withdrawal->id}");
            return $transaction;
        }
    }

    public function withdrawFromWallet(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'stylist') {
            return response()->json([
                'message' => 'Ooops.. Customers cannot withdraw from their balance yet'
            ], 400);
        }

        $validated = $request->validate([
            'amount' => ['required', 'gt:10', 'lt:5000000'],
            'method' => ['required'],
        ]);
        $paymentMethod = $user->stylistPaymentMethods()->where('id', $request->input('method'))->first();

        if (!$paymentMethod) {
            return response()->json([
                'message' => 'Ooops.. Specified payment method is invalid'
            ], 400);
        }

        $amount = (float) $validated['amount'];
        if ($amount > $user->balance) {
            return response()->json([
                'message' => 'Ooops.. Insufficient balance.'
            ], 400);
        }

        $paymentController = $this;
        DB::transaction(function () use ($amount, $paymentMethod, $user, $paymentController) {
            // Deduct amount from customer balance
            User::query()
                ->where('id', '=', $user->id)
                ->where('balance', '>=', $amount)
                ->update(['balance' => DB::raw("balance - {$amount}")]);

            $user->refresh();

            $withdrawal = $user->withdrawals()->create([
                'amount' => $amount,
                'stylist_payment_method_id' => $paymentMethod->id,
            ]);

            $transaction = $paymentController->withdrawFromPeachPayment($withdrawal, $paymentMethod, $user);

            defer(function () use ($withdrawal, $user) {
                $withdrawal->load('payment_method');
                Mail::to('admin@snipfair.com')->send(new WithdrawalNotificationEmail(
                    withdrawal: $withdrawal,
                    user: $user,
                    recipientType: 'admin'
                ));

                // Notify stylist
                Mail::to($user->email)->send(new WithdrawalNotificationEmail(
                    withdrawal: $withdrawal,
                    user: $user,
                    recipientType: 'stylist'
                ));
            });
        });

        return response()->noContent();
    }

    public function handlePayfastWebhook(Request $request)
    {
        Log::info('Payfast ITN received: ' . json_encode($request->all()));

        // Basic security checks (add more as per Payfast docs)
        $isValidHost = $this->pfValidIP($_SERVER['HTTP_REFERER']);
        if (!$isValidHost) {
            Log::warning('Invalid Payfast host IP: ' . $request->ip());
            return response('Invalid host', 400);
        }

        $pfData = $request->all();
        unset($pfData['signature']); // Remove for validation

        // Validate signature
        $generatedSignature = $this->generatePayfastSignature($pfData, config('payfast.passphrase'), 'webhook');
        if ($generatedSignature !== $request->input('signature')) {
            Log::error('Invalid Payfast signature');
            return response('Invalid signature', 400);
        }

        $transactionId = $pfData['m_payment_id'] ?? null;
        $deposit = Deposit::find($pfData['item_name'] ?? null);

        if (!$deposit) {
            Log::error("Deposit not found for item_name " . ($pfData['item_name'] ?? 'null'));
            return response('OK', 200); // acknowledge but skip
        }

        // Instead of failing immediately when appointment isn't ready, push to queue
        ProcessPayfastDeposit::dispatch($deposit, $pfData, $transactionId);

        return response('OK', 200);
    }

    private function pfValidIP($host)
    {
        // Variable initialization
        $validHosts = array(
            'www.payfast.co.za',
            'sandbox.payfast.co.za',
            'w1w.payfast.co.za',
            'w2w.payfast.co.za',
        );

        $validIps = [
            '3.163.236.237',
            '3.163.238.237',
            '3.163.251.237',
            '3.163.232.237',
            '3.163.241.237',
            '3.163.245.237',
            '3.163.248.237',
            '3.163.234.237',
            '3.163.237.237',
            '3.163.243.237',
            '3.163.247.237',
            '3.163.242.237',
            '3.163.244.237',
            '3.163.249.237',
            '3.163.252.237',
            '3.163.235.237',
            '3.163.239.237',
            '3.163.250.237',
            '3.163.233.237',
            '3.163.246.237',
            '3.163.240.237',
        ];

        foreach ($validHosts as $pfHostname) {
            $ips = gethostbynamel($pfHostname);

            if ($ips !== false)
                $validIps = array_merge($validIps, $ips);
        }

        // Remove duplicates
        $validIps = array_unique($validIps);
        $referrerIp = gethostbyname(parse_url($host)['host']);
        if (in_array($referrerIp, $validIps, true)) {
            return true;
        }
        return false;
    }

    private function generatePayfastSignature(array $data, ?string $passPhrase = null, ?string $type = null): string
    {
        // ksort($data);
        $paramString = '';
        foreach ($data as $key => $value) {
            if ($type === 'webhook' && $key !== 'signature') {
                $paramString .= $key . '=' . urlencode(trim((string) $value)) . '&';
            } else if ($value !== null && $value !== '') {
                $paramString .= $key . '=' . urlencode(trim((string) $value)) . '&';
            }
        }
        $paramString = rtrim($paramString, '&');

        if ($passPhrase) {
            $paramString .= '&passphrase=' . urlencode(trim($passPhrase));
        }

        return md5($paramString);
    }

    // Optional: Success/Cancel routes if using redirects (not needed for callback)
    public function success()
    {
        return inertia('PaymentSuccess'); // Render a success page
    }

    public function cancel()
    {
        return inertia('PaymentCancel'); // Render a cancel page
    }

    // Add routes for success/cancel if using redirects (optional for callback method)
}

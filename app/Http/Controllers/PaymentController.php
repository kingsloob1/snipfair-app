<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPayfastDeposit;
use App\Mail\DepositNotificationEmail;
use App\Models\AdminPaymentMethod;
use App\Models\Deposit;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use App\Models\Transaction;  // Your Transaction model
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    public function bankList(Request $request)
    {
        $list = [
            // Major/Commercial Banks
            ["name" => 'Absa Bank', "branchCode" => '632005'],
            ["name" => 'African Bank', "branchCode" => '430000'],
            ["name" => 'Bidvest Bank', "branchCode" => '462005'],
            ["name" => 'Capitec Bank', "branchCode" => '470010'],
            ["name" => 'Discovery Bank', "branchCode" => '679000'],
            ["name" => 'FirstRand Bank (FNB)', "branchCode" => '250655'],
            ["name" => 'Investec Bank', "branchCode" => '580105'],
            ["name" => 'Nedbank', "branchCode" => '198765'],
            ["name" => 'Sasfin Bank', "branchCode" => '683000'],
            ["name" => 'Standard Bank', "branchCode" => '051001'],
            ["name" => 'TymeBank', "branchCode" => '678910'],
            ["name" => 'Ubank', "branchCode" => '431010'],
            ["name" => 'Grindrod Bank', "branchCode" => '584000'],

            // Foreign Banks/Local Branches
            ["name" => 'Access Bank South Africa', "branchCode" => '410105'],
            ["name" => 'Albaraka Bank', "branchCode" => '800000'],
            ["name" => 'Bank of China', "branchCode" => '431000'],
            ["name" => 'Citibank', "branchCode" => '350000'],
            ["name" => 'HBZ Bank (Habib Bank AG Zurich)', "branchCode" => '570000'],
            ["name" => 'ICBC', "branchCode" => '495000'],
            ["name" => 'Société Générale', "branchCode" => '306009'],
            [
                "name" => 'China Construction Bank Johannesburg Branch',
                "branchCode" => null,
            ],
            ["name" => 'Bank of Taiwan South Africa Branch', "branchCode" => null],
            [
                "name" => 'JPMorgan Chase Bank, N.A., Johannesburg Branch',
                "branchCode" => '432000',
            ],
            [
                "name" => 'Standard Chartered Bank Johannesburg Branch',
                "branchCode" => '730000',
            ],
            [
                "name" => 'HSBC Bank plc - Johannesburg Branch',
                "branchCode" => '587000',
            ],
            [
                "name" => 'State Bank of India South Africa Branch',
                "branchCode" => '801000',
            ],

            // Mutual Banks
            ["name" => 'Bank Zero', "branchCode" => null],
            ["name" => 'Finbond Mutual Bank', "branchCode" => null],
            ["name" => 'GBS Mutual Bank', "branchCode" => null],
            ["name" => 'YWBN Mutual Bank', "branchCode" => null],

            // Co-operative Banks
            ["name" => 'Ditsobotla Primary Co-operative Bank', "branchCode" => null],
            ["name" => 'GIG Co-operative Bank', "branchCode" => null],
            ["name" => 'KSK Koöperatiewe Bank', "branchCode" => null],
            ["name" => 'OSK Koöperatiewe Bank', "branchCode" => null],
            ["name" => 'Ziphakamise Co-operative Bank', "branchCode" => null],
        ];

        return response()->json($list);
    }

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
        $data['signature'] = $this->generateSignature($data, config('payfast.passphrase'));

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

    public function webhook(Request $request)
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
        $generatedSignature = $this->generateSignature($pfData, config('payfast.passphrase'), 'webhook');
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

        $validIps = [];

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

    private function generateSignature(array $data, ?string $passPhrase = null, ?string $type = null): string
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

<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Mail\DepositNotificationEmail;
use App\Models\Transaction;
use App\Models\AppointmentPouch;
use App\Models\AdminPaymentMethod;
use App\Models\Deposit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get wallet balance (current user balance)
        $walletBalance = $user->balance ?? 0;

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

        $pendingAmount = AppointmentPouch::where('user_id', $user->id)
            ->where('status', 'holding')
            ->sum('amount');

        $walletStats = [
            'currentBalance' => (float) $walletBalance,
            'totalTopups' => (float) $totalTopups,
            'totalRefunds' => (float) $totalRefunds,
            'pendingTransactions' => $pendingTransactionCount,
        ];

        // Get payment methods for topup
        $paymentMethods = AdminPaymentMethod::where('is_active', true)
            ->get()
            ->map(function ($method) {
                return [
                    'id' => $method->id,
                    'account_name' => $method->account_name,
                    'bank_name' => $method->bank_name,
                    'account_number' => $method->account_number,
                    'routing_number' => $method->routing_number,
                ];
            });

        return Inertia::render('Customer/WalletPage', [
            'walletBalance' => (float) $walletBalance,
            'walletStats' => $walletStats,
            'transactions' => $transactions,
            'paymentMethods' => $paymentMethods,
            'pendingAmount' => (float) $pendingAmount,
        ]);
    }

    public function topup(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1|max:10000',
            'payment_method_id' => 'required|exists:admin_payment_methods,id',
        ]);

        $user = $request->user();

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
                'description' => 'Wallet top-up via ' . AdminPaymentMethod::find($request->payment_method_id)->bank_name,
            ]);

            $deposit = Deposit::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'transaction_id' => $transaction->id,
                'admin_payment_method_id' => $request->payment_method_id,
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

            return back()->with('success', 'Wallet top-up pending! Please wait for confirmation of the payment.');
        } catch (\Exception $e) {
            return back()->with('error', 'Top-up failed. Please try again.');
        }
    }

    // For demo purposes, we'll automatically approve the transaction
    // In a real application, this would be handled by payment gateway webhooks
    // $transaction->update(['status' => 'completed']);

    // // Update user balance
    // $user->increment('balance', $request->amount);

    public function getTransactions(Request $request)
    {
        $user = $request->user();

        $transactions = Transaction::where('user_id', $user->id)
            ->whereIn('type', ['topup', 'refund', 'payment'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'transactions' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }
}

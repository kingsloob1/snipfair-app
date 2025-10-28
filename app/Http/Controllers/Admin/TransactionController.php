<?php

namespace App\Http\Controllers\Admin;

use App\Events\AppointmentStatusUpdated;
use App\Http\Controllers\Controller;
use App\Mail\DepositConfirmationEmail;
use App\Mail\WithdrawalConfirmationEmail;
use App\Mail\WithdrawalRejectedEmail;
use App\Models\Appointment;
use App\Models\Deposit;
use App\Models\Transaction;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $admin = Auth::guard('admin')->user();

        // Fetch appointments with related data
        $appointments = Appointment::whereHas('customer')->whereHas('stylist')->whereHas('portfolio')->with([
            'customer:id,name,email,avatar',
            'stylist:id,name,email,avatar',
            'portfolio.category:id,name',
            'proof:id,media_urls,appointment_id',
        ])->latest()->get();

        // Fetch transactions with related data
        $transactions = Transaction::whereHas('user')->with([
            'user:id,name,email,avatar'
        ])->latest()->get();

        // Fetch subscriptions with related data
        $subscriptions = Subscription::whereHas('user')->with([
            'user:id,name,email,avatar',
            'plan:id,name,amount',
            'payment:id,status'
        ])->latest()->get();

        // Fetch withdrawal/payout requests
        $payout_requests = Withdrawal::whereHas('user')->with([
            'user:id,name,email,avatar',
            'payment_method:id,account_name,bank_name,account_number'
        ])->latest()->get()->map(function ($withdrawal) {
            return [
                'id' => $withdrawal->id,
                'stylist_name' => $withdrawal->user->name,
                'amount' => $withdrawal->amount,
                'payment_method' => $withdrawal->payment_method->bank_name ?? 'Bank Transfer',
                'submitted_date' => $withdrawal->created_at->toDateString(),
                'status' => $withdrawal->status,
                'profile_image' => $withdrawal->user->avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($withdrawal->user->name) . '&background=6366f1&color=ffffff',
                'account_name' => $withdrawal->payment_method->account_name ?? null,
                'bank_name' => $withdrawal->payment_method->bank_name ?? null,
                'account_number' => $withdrawal->payment_method->account_number ?? null,
            ];
        });

        $deposit_requests = Deposit::whereHas('user')->with([
            'user:id,name,email,avatar',
            'payment_method'
        ])->latest()->get()->map(function ($deposit) {
            $paymentMethod = $deposit->getRelation('payment_method');
            return [
                'id' => $deposit->id,
                'customer_name' => $deposit->user->name,
                'amount' => $deposit->amount,
                'payment_method' => $paymentMethod ? $paymentMethod->bank_name : 'Bank Transfer',
                'submitted_date' => $deposit->created_at->toDateString(),
                'status' => $deposit->status,
                'profile_image' => getAvatar($deposit->user),
                'account_name' => $paymentMethod->account_name ?? null,
                'bank_name' => $paymentMethod->bank_name ?? null,
                'account_number' => $paymentMethod->account_number ?? null,
            ];
        });

        // Calculate dashboard metrics
        $metrics = $this->calculateDashboardMetrics();

        return Inertia::render('Admin/Account/Transactions/Index', [
            'auth' => $admin,
            'appointments' => $appointments,
            'transactions' => $transactions,
            'subscriptions' => $subscriptions,
            'payout_requests' => $payout_requests,
            'deposit_requests' => $deposit_requests,
            'metrics' => $metrics,
        ]);
    }

    private function calculateDashboardMetrics()
    {
        $currencySymbol = getAdminConfig('currency_symbol');

        // Calculate total revenue (completed appointments)
        $currentMonthRevenue = Appointment::where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        $lastMonthRevenue = Appointment::where('status', 'completed')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('amount');

        $commissionEarned = Transaction::where('type', 'other')->where('ref', 'AdminCommission')
            ->where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');
        $commissionPercentage = $currentMonthRevenue > 0
            ? round(($commissionEarned / $currentMonthRevenue) * 100, 0)
            : 0;

        // Calculate revenue change percentage
        $revenueChangePercent = $lastMonthRevenue > 0
            ? round((($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        // Calculate pending payouts
        $pendingPayouts = Withdrawal::where('status', 'pending')->sum('amount');
        $pendingPayoutsCount = Withdrawal::where('status', 'pending')->count();

        // Calculate failed requests (deposits and withdrawals)
        $failedDeposits = Deposit::where('status', 'declined')->sum('amount');
        $failedWithdrawals = Withdrawal::where('status', 'declined')->sum('amount');
        $failedTotal = $failedDeposits + $failedWithdrawals;
        $failedCount = Deposit::where('status', 'declined')->count() +
            Withdrawal::where('status', 'declined')->count();

        return [
            'totalRevenue' => [
                'value' => $currencySymbol . number_format($currentMonthRevenue, 0),
                'change' => ($revenueChangePercent >= 0 ? '+' : '') . $revenueChangePercent . '% from last month',
                'changeType' => $revenueChangePercent >= 0 ? 'positive' : 'negative',
            ],
            'commissionEarned' => [
                'value' => $currencySymbol . number_format($commissionEarned, 0),
                'change' => $commissionPercentage . '% of total revenue',
                'changeType' => 'neutral',
            ],
            'pendingPayouts' => [
                'value' => $currencySymbol . number_format($pendingPayouts, 0),
                'subtitle' => $pendingPayoutsCount . ' request' . ($pendingPayoutsCount === 1 ? '' : 's') . ' pending',
            ],
            'failedRequests' => [
                'value' => $currencySymbol . number_format($failedTotal, 0),
                'subtitle' => $failedCount . ' transactions' . ($failedCount === 1 ? '' : 's') . ' failed',
            ],
        ];
    }

    public function updateTransactionStatus(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'status' => 'required|in:approved,declined,reversed,failed'
        ]); //'pending', 'completed', 'failed', 'reversed', 'approved', 'declined', 'processing'

        $transaction = Transaction::findOrFail($request->transaction_id);
        // if($transaction->type == 'topup' || $transaction->type == 'payment'){
        //     $deposit = Deposit::where('transaction_id', $transaction->id)->first();
        // }
        $transaction->update(['status' => $request->status]);

        return back()->with('message', 'Transaction status updated successfully.');
    }

    public function updateSubscriptionStatus(Request $request)
    {
        $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id',
            'status' => 'required|in:approved,declined,reversed'
        ]);

        $subscription = Subscription::findOrFail($request->subscription_id);

        // Update the related payment status
        if ($subscription->payment) {
            $subscription->payment->update(['status' => $request->status]);
        }

        return back()->with('message', 'Subscription status updated successfully.');
    }

    public function flagAppointment(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id'
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);
        $appointment->update(['status' => 'escalated']);

        return back()->with('message', 'Appointment flagged successfully.');
    }

    public function deleteAppointment(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id'
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);
        $appointment->delete();

        return back()->with('message', 'Appointment deleted successfully.');
    }

    public function flagTransaction(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id'
        ]);

        $transaction = Transaction::findOrFail($request->transaction_id);
        $transaction->update(['status' => 'failed']);

        return back()->with('message', 'Transaction flagged successfully.');
    }

    public function deleteTransaction(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id'
        ]);

        $transaction = Transaction::findOrFail($request->transaction_id);
        $transaction->delete();

        return back()->with('message', 'Transaction deleted successfully.');
    }

    public function flagSubscription(Request $request)
    {
        $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id'
        ]);

        $subscription = Subscription::findOrFail($request->subscription_id);

        // Update the related payment status to flagged
        if ($subscription->payment) {
            $subscription->payment->update(['status' => 'declined']);
        }

        return back()->with('message', 'Subscription flagged successfully.');
    }

    public function deleteSubscription(Request $request)
    {
        $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id'
        ]);

        $subscription = Subscription::findOrFail($request->subscription_id);
        $subscription->delete();

        return back()->with('message', 'Subscription deleted successfully.');
    }

    public function approveWithdrawal(Request $request, $id)
    {
        $withdrawal = Withdrawal::findOrFail($id);
        $stylist = $withdrawal->user;

        $transaction = Transaction::query()->whereLike('ref', "WDR-{$withdrawal->id}%")->where('type', '=', 'withdraw')->where('amount', '=', $withdrawal->amount)->first();

        if (!$transaction) {
            $transaction = Transaction::create([
                'user_id' => $stylist->id,
                'amount' => $withdrawal->amount,
                'type' => 'withdraw',
                'status' => 'completed',
                'ref' => 'WDR-' . $withdrawal->id,
                'description' => 'Withdrawal request approved',
            ]);
        }

        $withdrawal->update(['status' => 'approved']);
        $transaction->update(['status' => 'completed']);

        defer(function () use ($stylist, $withdrawal) {
            Mail::to($stylist->email)->send(new WithdrawalConfirmationEmail(
                withdrawal: $withdrawal,
                stylist: $stylist,
            ));
            sendNotification(
                $stylist->id,
                route('stylist.earnings'),
                'Withdrawal Approved Successfully',
                'Your withdrawal of R' . $withdrawal->amount . ' has been approved successfully, and you would receive it in your account shortly.',
                'normal',
            );
        });

        return back()->with('message', 'Withdrawal request approved successfully.');
    }

    public function rejectWithdrawal($id)
    {
        $withdrawal = Withdrawal::findOrFail($id);
        $stylist = $withdrawal->user;

        $transaction = Transaction::query()->whereLike('ref', "WDR-{$withdrawal->id}%")->where('type', '=', 'withdraw')->where('amount', '=', $withdrawal->amount)->first();

        if (!$transaction) {
            $transaction = Transaction::create([
                'user_id' => $stylist->id,
                'amount' => $withdrawal->amount,
                'type' => 'withdraw',
                'status' => 'failed',
                'ref' => 'WDR-' . $withdrawal->id,
                'description' => 'Withdrawal request rejected and refunded',
            ]);
        }

        // Refund the stylist's balance
        $stylist->increment('balance', $withdrawal->amount);
        $withdrawal->update(['status' => 'declined']);
        $transaction->update(['status' => 'failed']);

        defer(function () use ($stylist, $withdrawal) {
            Mail::to($stylist->email)->send(new WithdrawalRejectedEmail(
                withdrawal: $withdrawal,
                stylist: $stylist,
                newBalance: $stylist->balance // optionals
            ));
            sendNotification(
                $stylist->id,
                route('stylist.earnings'),
                'Withdrawal Rejected',
                'Your withdrawal of R' . $withdrawal->amount . ' has been rejected, and the amount has been refunded to your wallet.',
                'normal',
            );
        });

        return back()->with('message', 'Withdrawal request rejected successfully.');
    }

    public function approveDeposit($id)
    {
        $deposit = Deposit::whereHas('user')->with(['user', 'transaction', 'appointment'])->findOrFail($id);

        if (!$deposit->user) {
            return back()->with('error', 'Deposit request not found.');
        }

        $this->approveDepositNative($deposit, $deposit->transaction);

        return back()->with('message', 'Deposit request approved successfully.');
    }

    public function rejectDeposit($id)
    {
        $deposit = Deposit::whereHas('user')->with(['user', 'transaction', 'appointment'])->findOrFail($id);

        $this->rejectDepositNative($deposit, $deposit->transaction);

        return back()->with('message', 'Deposit request rejected successfully.');
    }

    public function approveDepositNative(Deposit $deposit, $transaction = null)
    {
        $appointment = $deposit->appointment;
        if ($appointment && !$deposit->$transaction) {
            $appointmentDepositTxn = $appointment
                ->transactions()
                ->where('type', '=', 'payment')
                ->whereLike('ref', "PAY-DEPOSIT-DEBIT-%", false)
                ->first();

            if ($appointmentDepositTxn) {
                $deposit->update([
                    'transaction_id' => $appointmentDepositTxn->id
                ]);

                $transaction = $appointmentDepositTxn;
            }
        }

        $deposit->update([
            'status' => 'approved',
        ]);

        if ($transaction) {
            $transaction->update([
                'status' => 'completed'
            ]);

            // fund transaction amountto wallet for topup
            if ($transaction->type === 'topup') {
                $amountToFund = abs($transaction->amount);

                // fund topup amount
                User::query()
                    ->where('id', '=', $transaction->user_id)
                    ->update(['balance' => DB::raw("balance + {$amountToFund}")]);
            }
        }

        if ($appointment) {
            //Cancel appointment here
            $previousStatus = $appointment->status;
            $appointment->status = 'pending';
            $appointment->save();

            broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
        }

        Mail::to($deposit->user->email)->send(new DepositConfirmationEmail(
            deposit: $deposit,
            customer: $deposit->user,
            newBalance: $deposit->user->balance
        ));

        sendNotification(
            $deposit->user->id,
            route('customer.wallet'),
            'Deposit Successful',
            'Your deposit of R' . $deposit->amount . ' has been successfully completed.',
            'normal',
        );

        return $transaction;
    }

    public function rejectDepositNative(Deposit $deposit, $transaction = null)
    {

        $appointment = $deposit->appointment;
        if ($appointment && !$deposit->$transaction) {
            $appointmentDepositTxn = $appointment
                ->transactions()
                ->where('type', '=', 'payment')
                ->whereLike('ref', "PAY-DEPOSIT-DEBIT-%", false)
                ->first();

            if ($appointmentDepositTxn) {
                $deposit->update([
                    'transaction_id' => $appointmentDepositTxn->id
                ]);

                $transaction = $appointmentDepositTxn;
            }
        }

        $deposit->update([
            'status' => 'declined',
        ]);

        if ($transaction) {
            $transaction->update([
                'status' => 'failed'
            ]);
        }

        if ($appointment) {
            //Reverse transaction for wallet debit
            $appointment
                ->transactions()
                ->where('type', '=', 'payment')
                ->whereLike('ref', "PAY-PARTIAL-WALLET-DEBIT-%", false)
                ->update([
                    'status' => 'reversed'
                ]);

            $amountToRefundFundCustomer = abs(((float) $appointment->amount) - ((float) $deposit->amount));

            // refund amount deducted from wallet for appointment
            User::query()
                ->where('id', '=', $appointment->customer_id)
                ->update(['balance' => DB::raw("balance + {$amountToRefundFundCustomer}")]);

            //Cancel appointment here
            $previousStatus = $appointment->status;
            $appointment->status = 'canceled';
            $appointment->save();

            broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
        }

        sendNotification(
            $deposit->user->id,
            route('customer.wallet'),
            'Deposit Rejected',
            'Your deposit of R' . $deposit->amount . ' has been rejected',
            'normal',
        );

        return $transaction;
    }
}

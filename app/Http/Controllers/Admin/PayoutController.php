<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PayoutController extends Controller
{
    public function approve(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            
            $withdrawal = Withdrawal::with(['user', 'payment_method'])->findOrFail($id);
            
            if ($withdrawal->status !== 'pending') {
                return back()->with('error', 'This payout request has already been processed.');
            }
            
            // Update withdrawal status
            $withdrawal->update([
                'status' => 'approved'
            ]);
            
            // Here you would integrate with your payment processor
            // For now, we'll just mark it as approved
            
            DB::commit();
            
            return back()->with('success', 'Payout request approved successfully.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to approve payout request: ' . $e->getMessage());
        }
    }
    
    public function reject(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            
            $withdrawal = Withdrawal::with(['user', 'payment_method'])->findOrFail($id);
            
            if ($withdrawal->status !== 'pending') {
                return back()->with('error', 'This payout request has already been processed.');
            }
            
            // Update withdrawal status
            $withdrawal->update([
                'status' => 'declined'
            ]);
            
            // Return the amount back to user's balance
            $withdrawal->user->increment('balance', $withdrawal->amount);
            
            DB::commit();
            
            return back()->with('success', 'Payout request rejected. Amount returned to stylist balance.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to reject payout request: ' . $e->getMessage());
        }
    }
}

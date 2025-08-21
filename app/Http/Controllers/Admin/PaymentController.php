<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        // Calculate KPIs
        $kpis = [
            'total_revenue' => Payment::where('status', 'success')->sum('amount'),
            'pending_amount' => Payment::where('status', 'pending')->sum('amount'),
            'total_transactions' => Payment::count(),
        ];

        // Fetch Payments with filters
        $payments = Payment::query()
            ->with(['booking.user:id,full_name', 'booking.car:id,brand,model']) // Eager load nested relationships
            // Filter by date range (paid_at)
            ->when($request->input('start_date'), function ($query, $startDate) {
                $query->whereDate('paid_at', '>=', $startDate);
            })
            ->when($request->input('end_date'), function ($query, $endDate) {
                $query->whereDate('paid_at', '<=', $endDate);
            })
            // Filter by payment status
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', 'like', $status);
            })
            // Filter by payment method
            ->when($request->input('method'), function ($query, $method) {
                $query->where('payment_method', 'like', $method);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'kpis' => $kpis,
            'filters' => $request->all(['start_date', 'end_date', 'status', 'method']),
        ]);
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['success', 'failed', 'pending'])],
        ]);

        $payment->update([
            'status' => $validated['status'],
            // If marking as success, set the paid_at timestamp
            'paid_at' => $validated['status'] === 'success' ? Carbon::now() : null,
        ]);

        // Optional: Update booking status based on payment
        if ($validated['status'] === 'success') {
            $payment->booking()->update(['status' => 'confirmed']);
        }

        return back()->with('success', 'Payment status updated successfully.');
    }
}
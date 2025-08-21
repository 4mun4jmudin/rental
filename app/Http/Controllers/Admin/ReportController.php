<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // 1. Tentukan rentang tanggal
        // Default: 30 hari terakhir
        $startDate = $request->input('start_date', Carbon::now()->subDays(29)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // Konversi ke objek Carbon untuk query
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // 2. Query data utama dalam rentang tanggal
        $bookingsInDateRange = Booking::whereBetween('created_at', [$start, $end])->get();
        $paymentsInDateRange = Payment::where('status', 'success')->whereBetween('paid_at', [$start, $end])->get();

        // 3. Hitung KPI (Key Performance Indicators)
        $kpis = [
            'total_revenue' => $paymentsInDateRange->sum('amount'),
            'total_bookings' => $bookingsInDateRange->count(),
            'avg_daily_rate' => $bookingsInDateRange->avg('total_price') / ($bookingsInDateRange->avg(fn($b) => Carbon::parse($b->start_date)->diffInDays($b->end_date) + 1) ?: 1),
        ];

        // 4. Data untuk Chart Pendapatan Harian
        $revenueChartData = Payment::where('status', 'success')
            ->whereBetween('paid_at', [$start, $end])
            ->select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(amount) as total'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->pluck('total', 'date');

        // 5. Data untuk Chart Status Pesanan
        $bookingStatusChartData = Booking::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        // 6. Data untuk Tabel Rincian
        $bookingDetails = Booking::with(['user:id,full_name', 'car:id,brand,model', 'payment:booking_id,status'])
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->paginate(15)
            ->withQueryString();


        return Inertia::render('Admin/Reports/Index', [
            'kpis' => $kpis,
            'revenueChartData' => $revenueChartData,
            'bookingStatusChartData' => $bookingStatusChartData,
            'bookingDetails' => $bookingDetails,
            'filters' => ['start_date' => $startDate, 'end_date' => $endDate],
        ]);
    }
}

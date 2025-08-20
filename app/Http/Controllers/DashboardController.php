<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Booking;
use App\Models\Car;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. KPI Cards Data
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        $kpi = [
            'revenue_today' => Payment::where('status', 'success')->whereDate('paid_at', $today)->sum('amount'),
            'revenue_month' => Payment::where('status', 'success')->where('paid_at', '>=', $startOfMonth)->sum('amount'),
            'new_bookings_today' => Booking::whereDate('created_at', $today)->count(),
            'new_users_today' => User::whereDate('created_at', $today)->count(),
            'available_cars' => Car::where('status', 'available')->count(),
        ];

        // 2. Grafik Tren Pesanan 7 Hari Terakhir
        $booking_trend = Booking::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->pluck('count', 'date');

        // 3. Grafik Pendapatan Bulanan (6 bulan terakhir)
        $monthly_revenue = Payment::select(
                DB::raw("DATE_FORMAT(paid_at, '%Y-%m') as month"),
                DB::raw('sum(amount) as total')
            )
            ->where('status', 'success')
            ->where('paid_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->pluck('total', 'month');

        // 4. Grafik Mobil Paling Populer
        $popular_cars = Booking::with('car')
            ->select('car_id', DB::raw('count(*) as total_bookings'))
            ->groupBy('car_id')
            ->orderBy('total_bookings', 'desc')
            ->limit(5)
            ->get()
            ->mapWithKeys(function ($item) {
                // Menggabungkan brand dan model, atau hanya brand jika model null
                $carName = $item->car ? ($item->car->brand . ' ' . $item->car->model) : 'Mobil Tidak Dikenal';
                return [$carName => $item->total_bookings];
            });


        // 5. Daftar Aktivitas Terbaru
        $recent_activities = Booking::with('user', 'car')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($booking) {
                $carName = $booking->car ? $booking->car->brand . ' ' . $booking->car->model : 'Mobil';
                $userName = $booking->user ? $booking->user->full_name : 'Pengguna';
                return "Pesanan baru (#{$booking->id}) untuk {$carName} oleh {$userName}.";
            });
            
        // 6. Tugas yang Membutuhkan Tindakan (Contoh data statis)
        $actionable_items = [
            ['text' => '5 Pengguna menunggu verifikasi.', 'href' => '#'],
            ['text' => '2 ulasan dilaporkan pengguna.', 'href' => '#'],
        ];

        return Inertia::render('Admin/Dashboard/Index', [
            'kpi' => $kpi,
            'bookingTrend' => $booking_trend,
            'monthlyRevenue' => $monthly_revenue,
            'popularCars' => $popular_cars,
            'recentActivities' => $recent_activities,
            'actionableItems' => $actionable_items,
        ]);
    }
}
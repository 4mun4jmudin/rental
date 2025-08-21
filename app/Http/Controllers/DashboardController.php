<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Menampilkan halaman dasbor yang sesuai berdasarkan peran pengguna.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        // JIKA PENGGUNA ADALAH ADMIN, TAMPILKAN DASBOR ADMIN DENGAN DATA LENGKAP
        if ($user->role === 'admin') {
            
            // 1. Data untuk Kartu KPI (Key Performance Indicator)
            $kpi = [
                'revenue_today' => Booking::whereDate('created_at', Carbon::today())->sum('total_price'),
                'revenue_month' => Booking::whereMonth('created_at', Carbon::now()->month)
                                          ->whereYear('created_at', Carbon::now()->year)
                                          ->sum('total_price'),
                'new_bookings_today' => Booking::whereDate('created_at', Carbon::today())->count(),
                'new_users_today' => User::whereDate('created_at', Carbon::today())->where('role', 'penyewa')->count(),
            ];

            // 2. Data untuk Grafik Tren Pesanan (7 Hari Terakhir)
            $bookingTrend = Booking::query()
                ->where('created_at', '>=', Carbon::now()->subDays(6)) // Mengambil data 7 hari termasuk hari ini
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->pluck('count', 'date');
            
            // Inisialisasi array untuk 7 hari terakhir dengan nilai 0
            $trendData = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->format('Y-m-d');
                $trendData[$date] = $bookingTrend->get($date, 0);
            }

            // 3. Data untuk Grafik Mobil Populer (Top 5)
            $popularCars = Booking::query()
                ->join('cars', 'bookings.car_id', '=', 'cars.id')
                ->select('cars.model', DB::raw('count(bookings.id) as booking_count'))
                ->where('bookings.created_at', '>=', Carbon::now()->subDays(30)) // Analisis popularitas 30 hari terakhir
                ->groupBy('cars.model')
                ->orderBy('booking_count', 'desc')
                ->limit(5)
                ->get()
                ->pluck('booking_count', 'model')
                ->toArray();
            
            // 4. Data Dummy untuk Aktivitas & Tindakan (sesuaikan dengan logika bisnis Anda)
            // Ini bisa dikembangkan lebih lanjut dengan mengambil data dari tabel notifikasi atau log
            $recentActivities = [
                "Pesanan baru #1021 oleh Budi Susilawati telah dibuat.",
                "Pengguna baru 'Dewi Lestari' telah mendaftar.",
                "Pembayaran untuk pesanan #1019 telah berhasil dikonfirmasi.",
                "Mobil Toyota Avanza (B1234AA) ditandai sebagai 'maintenance'.",
            ];

            $actionableItems = [
                ['text' => Booking::where('status', 'pending')->count() . ' pesanan menunggu konfirmasi.', 'href' => '#'],
                ['text' => '2 mobil perlu jadwal perawatan rutin.', 'href' => '#'],
            ];

            // Render view dasbor admin dengan semua data yang diperlukan
            return Inertia::render('Admin/Dashboard/Index', [
                'kpi' => $kpi,
                'bookingTrend' => $trendData,
                'popularCars' => $popularCars,
                'monthlyRevenue' => [], // Placeholder, bisa diisi dengan data pendapatan 6 bulan terakhir
                'recentActivities' => $recentActivities,
                'actionableItems' => $actionableItems,
            ]);
        }

        // JIKA BUKAN ADMIN (misal: penyewa, kasir, dll.), TAMPILKAN DASBOR PENGGUNA BIASA
        // Anda bisa menambahkan logika untuk mengambil data spesifik untuk peran lain di sini
        return Inertia::render('Dashboard'); 
    }
}
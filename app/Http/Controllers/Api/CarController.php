<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    /**
     * Menampilkan daftar mobil yang tersedia untuk disewa.
     */
    public function index()
    {
        $cars = Car::where('status', 'available')
            ->withAvg('reviews', 'rating') // Menghitung rata-rata rating dari relasi 'reviews'
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cars,
        ]);
    }

    /**
     * Menampilkan detail satu mobil.
     */
    public function show(Car $car)
    {
        // Anda bisa menambahkan logika lain di sini jika perlu
        return response()->json([
            'success' => true,
            'data' => $car->loadAvg('reviews', 'rating'),
        ]);
    }
}
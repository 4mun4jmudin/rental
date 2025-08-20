<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

// === IMPORT CONTROLLER UNTUK HALAMAN WEB (INERTIA) ===
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController; // Pastikan ini adalah controller di app/Http/Controllers/

// === IMPORT CONTROLLER UNTUK API ===
use App\Http\Controllers\Api\AuthController;


/*
|--------------------------------------------------------------------------
| RUTE UNTUK TAMPILAN PUBLIK & OTENTIKASI API
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Rute untuk proses login/register API (jika Anda menggunakannya)
Route::post('/api/register', [AuthController::class, 'register']);
Route::post('/api/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| RUTE UNTUK HALAMAN WEB YANG MEMBUTUHKAN LOGIN (INERTIA)
|--------------------------------------------------------------------------
| Semua rute di sini hanya bisa diakses setelah pengguna login.
*/
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Rute untuk Halaman Dashboard Utama
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rute untuk Halaman Profil Pengguna
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Rute untuk Modul Manajemen Pengguna
    Route::resource('users', UserController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    // Anda bisa menambahkan rute resource lain untuk halaman admin di sini
    // Contoh: Route::resource('cars', App\Http\Controllers\CarController::class);

});


/*
|--------------------------------------------------------------------------
| RUTE UNTUK API YANG MEMBUTUHKAN AUTENTIKASI TOKEN (SANCTUM)
|--------------------------------------------------------------------------
| Semua rute di sini harus diawali dengan /api/
*/
Route::prefix('api')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rute API Resource (menggunakan namespace lengkap untuk menghindari konflik)
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    Route::apiResource('cars', \App\Http\Controllers\Api\CarController::class);
    Route::apiResource('bookings', \App\Http\Controllers\Api\BookingController::class);
    Route::apiResource('payments', \App\Http\Controllers\Api\PaymentController::class);
    Route::apiResource('reviews', \App\Http\Controllers\Api\ReviewController::class);
});

Route::middleware(['auth', 'isAdmin'])->group(function () {
    // Route lain...
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
});


// Memuat rute-rute otentikasi standar dari Laravel (untuk halaman login, register, dll.)
require __DIR__.'/auth.php';
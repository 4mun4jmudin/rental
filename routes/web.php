<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;


use App\Http\Controllers\Admin\CarController;
use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\VerificationController;
use App\Http\Controllers\Admin\ContentController; // Untuk konten dan pemasaran

use App\Http\Controllers\Admin\ReportController; // Untuk laporan
use App\Http\Controllers\Admin\SettingController; // Untuk pengaturan sistem
use App\Http\Controllers\Api\BookingController as ApiBookingController;
use App\Http\Controllers\Api\PaymentController as ApiPaymentController;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::middleware(['auth', 'verified'])->group(function () {

    // --- Rute untuk Semua Peran (Penyewa, Admin, dll) ---
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);
        Route::resource('cars', CarController::class)->except(['show']); // Jadi lebih singkat
        Route::post('cars/bulk-update-status', [CarController::class, 'bulkUpdateStatus'])->name('cars.bulkUpdateStatus');
        Route::post('bookings/bulk-update-status', [BookingController::class, 'bulkUpdateStatus'])->name('bookings.bulkUpdateStatus');
        Route::resource('bookings', BookingController::class);

        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::put('payments/{payment}', [PaymentController::class, 'update'])->name('payments.update');

        Route::get('verifications', [VerificationController::class, 'index'])->name('verifications.index');
        Route::put('verifications/documents/{document}', [VerificationController::class, 'updateDocumentStatus'])->name('verifications.document.update');

        // Add Content & Marketing Routes
        Route::get('content', [ContentController::class, 'index'])->name('content.index');
        // Promotions
        Route::post('content/promotions', [ContentController::class, 'storePromotion'])->name('content.promotions.store');
        Route::put('content/promotions/{promotion}', [ContentController::class, 'updatePromotion'])->name('content.promotions.update'); // Tambahkan ini
        Route::delete('content/promotions/{promotion}', [ContentController::class, 'destroyPromotion'])->name('content.promotions.destroy'); // Tambahkan ini
        // Banners
        Route::post('content/banners', [ContentController::class, 'storeBanner'])->name('content.banners.store');
        Route::post('content/banners/{banner}', [ContentController::class, 'updateBanner'])->name('content.banners.update'); // Ubah dari PUT ke POST untuk file
        Route::delete('content/banners/{banner}', [ContentController::class, 'destroyBanner'])->name('content.banners.destroy'); // Tambahkan ini });
        Route::put('content/banners/{banner}/status', [ContentController::class, 'updateBannerStatus'])->name('content.banners.updateStatus');

        // Add Report Route
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

        // Rute Pengaturan Sistem
        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
        Route::put('/settings/password', [SettingController::class, 'changePassword'])->name('settings.change_password');
    });
  
});


// Memuat rute-rute otentikasi standar dari Laravel (untuk halaman login, register, dll.)
require __DIR__ . '/auth.php';

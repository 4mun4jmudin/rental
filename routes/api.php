
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import controllers dari direktori Admin
use App\Http\Controllers\Admin\AuthController;
// use App\Http\Controllers\Admin\CarController;
use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Api\CarController;    // <-- Tambahkan ini
use App\Http\Controllers\Api\BannerController;


/*
|--------------------------------------------------------------------------
| Rute-rute API Publik (Tidak memerlukan autentikasi)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// Route::get('/cars', [CarController::class, 'index']);
// Route::get('/cars/{car}', [CarController::class, 'show']);

// Route untuk data publik (tidak perlu login)
Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/{car}', [CarController::class, 'show']);
Route::get('/banners', [BannerController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Rute-rute API Terproteksi (Memerlukan autentikasi Sanctum)
|--------------------------------------------------------------------------
| File migrasi 'personal_access_tokens' Anda akan mendukung ini.
|
*/
Route::middleware('auth:sanctum')->group(function () {
    // Rute Otentikasi
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user()
            ]
        ]);
    });

    // Rute Data
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/reviews', [ReviewController::class, 'store']);
});

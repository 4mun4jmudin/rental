<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User; // Import model User
use Illuminate\Support\Facades\Hash; // Import facade Hash untuk enkripsi password
use Illuminate\Support\Facades\Auth; // Import facade Auth untuk autentikasi
use Illuminate\Validation\ValidationException; // Import untuk menangani exception validasi

class AuthController extends Controller
{
    /**
     * Mendaftarkan pengguna baru.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            // Validasi data yang masuk
            $request->validate([
                'full_name' => ['required', 'string', 'max:100'],
                'email' => ['required', 'string', 'email', 'max:100', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                // password_confirmation akan otomatis divalidasi oleh 'confirmed'
            ]);

            // Buat pengguna baru
            $user = User::create([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make($request->password), // Enkripsi password
                'role' => 'penyewa', // Set role default sebagai 'penyewa'
            ]);

            // Buat token Sanctum untuk pengguna
            // Anda bisa memberi nama token sesuai kebutuhan, contoh: 'auth_token'
            $token = $user->createToken('auth_token')->plainTextToken;

            // Kembalikan respons sukses
            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil!',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ], 201); // 201 Created

        } catch (ValidationException $e) {
            // Tangani error validasi
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $e->errors(),
            ], 422); // 422 Unprocessable Entity
        } catch (\Exception $e) {
            // Tangani error umum lainnya
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server.',
                'error' => $e->getMessage(), // Hanya untuk debug, jangan di production
            ], 500); // 500 Internal Server Error
        }
    }

    /**
     * Melakukan login pengguna.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Validasi data yang masuk
            $request->validate([
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
            ]);

            // Coba autentikasi pengguna
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email atau kata sandi salah.',
                ], 401); // 401 Unauthorized
            }

            // Dapatkan pengguna yang terautentikasi
            $user = Auth::user();

            // Hapus token lama jika ada (opsional, untuk memastikan hanya ada satu token aktif)
            // $user->tokens()->delete();

            // Buat token Sanctum baru
            $token = $user->createToken('auth_token')->plainTextToken;

            // Kembalikan respons sukses
            return response()->json([
                'success' => true,
                'message' => 'Login berhasil!',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ]);

        } catch (ValidationException $e) {
            // Tangani error validasi
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Tangani error umum lainnya
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server.',
                'error' => $e->getMessage(), // Hanya untuk debug, jangan di production
            ], 500);
        }
    }

    /**
     * Melakukan logout pengguna (menghapus token saat ini).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Hapus token yang sedang digunakan oleh pengguna saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Mengambil data pengguna yang sedang login.
     * Rute ini dipanggil oleh Flutter setelah login berhasil.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    }
}
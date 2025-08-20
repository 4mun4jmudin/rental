<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class UserController extends Controller
{
    /**
     * Menampilkan daftar pengguna dengan filter dan paginasi.
     */
    public function index(Request $request)
    {
        // Filter berdasarkan pencarian nama atau email
        $filters = $request->only('search');
        
        $users = User::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('full_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->where('role', 'penyewa') // Fokus pada daftar penyewa terlebih dahulu
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString(); // Agar parameter filter tetap ada di URL paginasi

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $filters,
        ]);
    }
    
    // Nanti kita akan tambahkan fungsi lain seperti store, update, destroy di sini
}
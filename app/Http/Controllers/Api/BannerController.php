<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    /**
     * Menampilkan daftar banner yang aktif.
     */
    public function index()
    {
        $banners = Banner::where('is_published', true)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }
}
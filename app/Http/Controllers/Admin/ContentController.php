<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Content/Index', [
            'promotions' => Promotion::latest()->get(),
            'banners' => Banner::latest()->get(),
        ]);
    }

    public function storePromotion(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:promotions,code',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
        ]);

        Promotion::create($validated);
        return back()->with('success', 'Promo code created successfully.');
    }

    public function storeBanner(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'target_url' => 'nullable|url',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $path = $request->file('image')->store('banners', 'public');

        Banner::create([
            'title' => $validated['title'],
            'target_url' => $validated['target_url'],
            'image_path' => $path,
        ]);

        return back()->with('success', 'Banner uploaded successfully.');
    }

    public function updateBannerStatus(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'is_published' => 'required|boolean',
        ]);

        $banner->update(['is_published' => $validated['is_published']]);

        return back()->with('success', 'Banner status updated.');
    }

    public function updatePromotion(Request $request, Promotion $promotion)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', Rule::unique('promotions')->ignore($promotion->id)],
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'is_active' => 'required|boolean',
        ]);

        $promotion->update($validated);
        return back()->with('success', 'Promo code updated successfully.');
    }

    public function destroyPromotion(Promotion $promotion)
    {
        $promotion->delete();
        return back()->with('success', 'Promo code deleted successfully.');
    }

    public function updateBanner(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'target_url' => 'nullable|url',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_published' => 'required|boolean',
        ]);
        
        if ($request->hasFile('image')) {
            // Hapus gambar lama
            Storage::disk('public')->delete($banner->image_path);
            // Simpan gambar baru
            $validated['image_path'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($validated);
        return back()->with('success', 'Banner updated successfully.');
    }

    public function destroyBanner(Banner $banner)
    {
        Storage::disk('public')->delete($banner->image_path);
        $banner->delete();
        return back()->with('success', 'Banner deleted successfully.');
    }
}

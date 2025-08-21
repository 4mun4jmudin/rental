<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CarController extends Controller
{
    /**
     * Menampilkan daftar semua mobil.
     */
    public function index(Request $request)
    {
        // Ambil semua brand unik untuk dropdown filter
        $brands = Car::distinct()->pluck('brand');

        $cars = Car::query()
            ->withAvg('reviews', 'rating')
            // Filter 1: Pencarian umum (search)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('brand', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%")
                      ->orWhere('license_plate', 'like', "%{$search}%");
                });
            })
            // Filter 2: Status
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            // Filter 3: Brand
            ->when($request->input('brand'), function ($query, $brand) {
                $query->where('brand', $brand);
            })
            // Filter 4: Tahun
            ->when($request->input('year_from'), function ($query, $year) {
                $query->where('year', '>=', $year);
            })
            ->when($request->input('year_to'), function ($query, $year) {
                $query->where('year', '<=', $year);
            })
            // Filter 5: Rentang Harga
            ->when($request->input('price_from'), function ($query, $price) {
                $query->where('price_per_day', '>=', $price);
            })
            ->when($request->input('price_to'), function ($query, $price) {
                $query->where('price_per_day', '<=', $price);
            })
            // Filter 6: Fitur (JSON Contains)
            ->when($request->input('features'), function ($query, $features) {
                // Pastikan $features adalah array
                $features = is_array($features) ? $features : [$features];
                foreach ($features as $feature) {
                    // Query ini mencari apakah 'features' JSON column mengandung key yang diberikan
                    // Contoh: "features" -> {"AC": true, "GPS": true}
                    $query->whereJsonContains('features', [$feature]);
                }
            })
            ->latest()
            ->paginate(10)
            ->withQueryString(); // Penting agar paginasi tetap membawa parameter filter

        return Inertia::render('Admin/Cars/Index', [
            'cars' => $cars,
            'brands' => $brands, // Kirim daftar brand ke frontend
            'filters' => $request->all(['search', 'status', 'brand', 'year_from', 'year_to', 'price_from', 'price_to', 'features']),
        ]);
    }

    /**
     * Menampilkan form untuk membuat mobil baru.
     */
    public function create()
    {
        return Inertia::render('Admin/Cars/Create');
    }

    /**
     * Menyimpan mobil baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'year' => 'required|digits:4|integer|min:1900|max:' . (date('Y') + 1),
            'license_plate' => 'required|string|max:15|unique:cars',
            'price_per_day' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['available', 'rented', 'maintenance'])],
            'features' => 'nullable|array',
            'image_files' => 'required|array|min:1',
            'image_files.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $imagePaths = [];
        if ($request->hasFile('image_files')) {
            foreach ($request->file('image_files') as $file) {
                $imagePaths[] = $file->store('cars', 'public');
            }
        }

        Car::create(array_merge($validated, [
            'image_urls' => $imagePaths,
        ]));

        return redirect()->route('admin.cars.index')->with('success', 'Mobil berhasil ditambahkan.');
    }

    /**
     * Menampilkan form untuk mengedit mobil.
     */
    public function edit(Car $car)
    {
        return Inertia::render('Admin/Cars/Edit', [
            'car' => $car,
        ]);
    }

    /**
     * Memperbarui data mobil di database.
     */
    /**
     * Memperbarui data mobil di database.
     */
    public function update(Request $request, Car $car)
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'year' => 'required|digits:4|integer|min:1900|max:' . (date('Y') + 1),
            'license_plate' => ['required', 'string', 'max:15', Rule::unique('cars')->ignore($car->id)],
            'price_per_day' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['available', 'rented', 'maintenance'])],
            'features' => 'nullable|array',
            'images_to_delete' => 'nullable|array',
            'images_to_delete.*' => 'string', // daftar URL gambar yang akan dihapus
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048', // gambar baru
        ]);

        $currentImageUrls = $car->image_urls ?? [];

        // 1. Hapus gambar yang diminta untuk dihapus
        if (!empty($validated['images_to_delete'])) {
            $imagesToDelete = $validated['images_to_delete'];
            // Hapus file dari storage
            Storage::disk('public')->delete($imagesToDelete);
            // Hapus URL dari array
            $currentImageUrls = array_diff($currentImageUrls, $imagesToDelete);
        }

        // 2. Tambah gambar baru
        $newImagePaths = [];
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $file) {
                $newImagePaths[] = $file->store('cars', 'public');
            }
        }

        // Gabungkan gambar lama (yang tidak dihapus) dengan gambar baru
        $allImageUrls = array_merge(array_values($currentImageUrls), $newImagePaths);

        // Update data mobil
        $car->update(array_merge($validated, [
            'image_urls' => $allImageUrls,
        ]));

        return redirect()->route('admin.cars.index')->with('success', 'Data mobil berhasil diperbarui.');
    }
    /**
     * Menghapus mobil dari database.
     */
    public function destroy(Car $car)
    {
        // Hapus semua gambar terkait dari storage
        if ($car->image_urls) {
            foreach ($car->image_urls as $imageUrl) {
                Storage::disk('public')->delete($imageUrl);
            }
        }

        $car->delete();

        return redirect()->route('admin.cars.index')->with('success', 'Mobil berhasil dihapus.');
    }

    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:cars,id',
            'status' => ['required', Rule::in(['available', 'maintenance'])],
        ]);

        Car::whereIn('id', $request->ids)->update(['status' => $request->status]);

        return back()->with('success', count($request->ids) . ' mobil berhasil diperbarui.');
    }
}

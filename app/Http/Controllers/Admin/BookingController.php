<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Query dasar dengan relasi yang dibutuhkan
        $query = Booking::query()->with(['user:id,full_name', 'car:id,brand,model', 'payment:booking_id,status']);

        // Jika request meminta data untuk kalender, kirim semua data tanpa paginasi
        if ($request->wantsJson() && $request->input('view') === 'calendar') {
            $bookings = $query->where('status', '!=', 'cancelled')->get();
            return response()->json($bookings);
        }

        // Logika untuk tampilan daftar (list view) dengan paginasi dan filter
        $bookings = $query
            ->when($request->input('start_date'), fn($q, $d) => $q->where('start_date', '>=', $d))
            ->when($request->input('end_date'), fn($q, $d) => $q->where('end_date', '<=', $d))
            ->when($request->input('status'), fn($q, $s) => $q->where('status', $s))
            ->when($request->input('payment_status'), fn($q, $s) => $q->whereHas('payment', fn($pq) => $pq->where('status', $s)))
            ->when($request->input('car_id'), fn($q, $id) => $q->where('car_id', $id))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'cars' => Car::select('id', 'brand', 'model')->get(),
            'users' => User::select('id', 'full_name')->where('role', 'penyewa')->get(),
            'filters' => $request->all(['start_date', 'end_date', 'status', 'payment_status', 'car_id']),
        ]);
    }

    public function show(Booking $booking)
    {
        // Muat semua relasi untuk modal detail
        $booking->load(['user', 'car', 'payment']);
        return response()->json($booking);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'car_id' => 'required|exists:cars,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Validasi tumpang tindih (overlap)
        $isOverlapping = Booking::where('car_id', $validated['car_id'])
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($validated) {
                $query->where(function ($q) use ($validated) {
                    $q->where('start_date', '<=', $validated['end_date'])
                        ->where('end_date', '>=', $validated['start_date']);
                });
            })->exists();

        if ($isOverlapping) {
            return back()->withErrors(['car_id' => 'Mobil tidak tersedia pada rentang tanggal yang dipilih.']);
        }

        $car = Car::find($validated['car_id']);
        $days = Carbon::parse($validated['start_date'])->diffInDays(Carbon::parse($validated['end_date'])) + 1;
        $totalPrice = $days * $car->price_per_day;

        Booking::create(array_merge($validated, [
            'total_price' => $totalPrice,
            'status' => 'confirmed', // Pesanan dari admin langsung dikonfirmasi
        ]));

        return back()->with('success', 'Pesanan baru berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Booking $booking)
    {
        $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
        ]);

        $booking->update(['status' => $request->status]);

        // Optional: Add logic to change car status if booking is completed/cancelled
        if (in_array($request->status, ['completed', 'cancelled'])) {
            $booking->car()->update(['status' => 'available']);
        }

        return back()->with('success', 'Booking status has been updated.');
    }

    /**
     * Update the status of multiple bookings.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:bookings,id',
            'status' => ['required', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
        ]);

        Booking::whereIn('id', $request->ids)->update(['status' => $request->status]);

        return back()->with('success', count($request->ids) . ' bookings have been updated.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Booking $booking)
    {
        // Add logic to prevent deletion of active bookings if needed
        if ($booking->status === 'confirmed' && $booking->start_date >= Carbon::today()) {
            return back()->with('error', 'Cannot delete an active or upcoming confirmed booking.');
        }

        $booking->delete();

        return back()->with('success', 'Booking has been deleted.');
    }
}

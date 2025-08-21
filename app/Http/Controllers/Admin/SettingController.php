<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SettingController extends Controller
{
    /**
     * Tampilkan halaman settings (cached)
     */
    public function index(Request $request)
    {
        // role check: hanya admin / pemilik_rental boleh mengakses panel settings
        if (!in_array($request->user()->role, ['admin', 'pemilik_rental'])) {
            abort(403);
        }

        // Ambil settings dari cache jika ada
        $settings = Cache::remember('settings', 3600, function () {
            return Setting::all()->mapWithKeys(function (Setting $s) {
                return [$s->key => $s->value];
            })->all();
        });

        return Inertia::render('Admin/Settings/Index', ['settings' => $settings]);
    }

    /**
     * Update settings (multi-key)
     */
    public function update(Request $request)
    {
        // role check
        if (!in_array($request->user()->role, ['admin', 'pemilik_rental'])) {
            abort(403);
        }

        $validatedData = $request->validate([
            // General
            'site_name' => 'nullable|string|max:255',
            'maintenance_mode' => 'nullable|boolean',
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:1024',
            'favicon' => 'nullable|image|mimes:ico,x-icon,png|max:256',

            // Booking
            'min_rental_days' => 'nullable|integer|min:1',
            'max_rental_days' => 'nullable|integer|gte:min_rental_days',
            'booking_buffer_hours' => 'nullable|integer|min:0',
            'auto_confirm_payment' => 'nullable|boolean',

            // Pricing & Fees
            'tax_percent' => 'nullable|numeric|min:0|max:100',
            'service_fee_type' => 'nullable|in:fixed,percentage',
            'service_fee_value' => 'nullable|numeric|min:0',

            // Payment
            'payment_methods' => 'nullable|array',
            'payment_methods.*' => 'string',
            'stripe_secret_key' => 'nullable|string',
            'midtrans_server_key' => 'nullable|string',

            // Notifications / SMTP
            'smtp_host' => 'nullable|string',
            'smtp_port' => 'nullable|integer',
            'smtp_user' => 'nullable|string',
            'smtp_pass' => 'nullable|string',

            // Fleet / docs
            'default_car_placeholder' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',

            // Security
            'session_timeout' => 'nullable|integer|min:1',
            'admin_ip_whitelist' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $fileKeys = ['logo', 'favicon', 'default_car_placeholder'];
            foreach ($fileKeys as $fileKey) {
                if ($request->hasFile($fileKey)) {
                    $file = $request->file($fileKey);
                    $path = $file->store('settings', 'public');

                    // delete old file if exists
                    $old = Setting::where('key', $fileKey)->value('value');
                    if ($old && Storage::disk('public')->exists($old) && $old !== $path) {
                        Storage::disk('public')->delete($old);
                    }

                    Setting::updateOrCreate(
                        ['key' => $fileKey],
                        [
                            'value' => $path,
                            'type' => 'string',
                            'group' => 'general',
                            'is_secret' => 0,
                        ]
                    );

                    DB::table('settings_changes')->insert([
                        'setting_key' => $fileKey,
                        'old_value' => $old,
                        'new_value' => $path,
                        'changed_by' => $request->user()->id,
                        'created_at' => now(),
                    ]);
                }
            }

            $skipKeys = array_merge(['_method', '_token'], $fileKeys);

            foreach ($request->except($skipKeys) as $key => $value) {
                if (is_array($value)) {
                    $storeValue = json_encode($value);
                    $type = 'json';
                } else {
                    if (is_bool($value)) {
                        $storeValue = $value ? '1' : '0';
                        $type = 'boolean';
                    } else {
                        $storeValue = (string) $value;
                        $type = 'string';
                    }
                }

                $lower = strtolower($key);
                $isSecret = preg_match('/(secret|api_key|api-key|token|password|pass|key)$/i', $lower) ? 1 : 0;

                $group = 'general';
                if (str_starts_with($lower, 'smtp_') || $lower === 'smtp_host') $group = 'notifications';
                if (str_starts_with($lower, 'stripe_') || str_contains($lower, 'midtrans') || $lower === 'payment_methods') $group = 'payment';
                if (str_starts_with($lower, 'tax') || str_contains($lower, 'fee')) $group = 'pricing';
                if (str_contains($lower, 'car') || str_contains($lower, 'fleet')) $group = 'fleet';
                if (str_contains($lower, 'notification') || str_contains($lower, 'smtp')) $group = 'notifications';
                if ($lower === 'maintenance_mode' || $lower === 'session_timeout' || $lower === 'admin_ip_whitelist') $group = 'security';

                $old = Setting::where('key', $key)->value('value');

                $toSave = $storeValue;
                if ($isSecret && $storeValue !== '') {
                    $toSave = encrypt($storeValue);
                }

                Setting::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => $toSave,
                        'type' => $type,
                        'group' => $group,
                        'is_secret' => $isSecret,
                    ]
                );

                DB::table('settings_changes')->insert([
                    'setting_key' => $key,
                    'old_value' => $old,
                    'new_value' => $toSave,
                    'changed_by' => $request->user()->id,
                    'created_at' => now(),
                ]);
            }

            Cache::forget('settings');
            DB::commit();

            return back()->with('success', 'Pengaturan berhasil diperbarui.');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            return back()->with('error', 'Terjadi kesalahan saat menyimpan pengaturan: ' . $e->getMessage());
        }
    }

    /**
     * Change current admin user's password (super admin task).
     * Only role 'admin' allowed to change here.
     */
    public function changePassword(Request $request)
    {
        // only allow admin role (super admin)
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'Kata sandi saat ini tidak cocok.']);
        }

        // Update password securely
        $user->password = Hash::make($validated['password']);
        // rotate remember token to invalidate "remember me" sessions
        $user->setRememberToken(Str::random(60));
        $user->save();

        // audit: log password change in settings_changes with masked values (do not store raw passwords)
        DB::table('settings_changes')->insert([
            'setting_key' => 'admin_password_change',
            'old_value' => null,
            'new_value' => '****', // masked indicator
            'changed_by' => $user->id,
            'created_at' => now(),
        ]);

        return back()->with('success', 'Password admin berhasil diubah.');
    }
}

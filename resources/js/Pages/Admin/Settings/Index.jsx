import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Textarea from '@/Components/Textarea';
import { Switch } from '@headlessui/react';

/**
 * Simple getter with fallback for settings object coming from server.
 */
const get = (settings, key, fallback = '') => {
    if (!settings) return fallback;
    // If settings key exists and is not null/undefined, return it.
    return typeof settings[key] !== 'undefined' && settings[key] !== null ? settings[key] : fallback;
};

/* ---------------- General Form ---------------- */
const GeneralSettingsForm = ({ settings }) => {
    // Use _method spoofing so we can post with files
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        site_name: get(settings, 'site_name', ''),
        maintenance_mode: get(settings, 'maintenance_mode', false),
        logo: null,
        favicon: null,
    });

    const submit = (e) => {
        e.preventDefault();
        // Use post + forceFormData to include file
        post(route('admin.settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800">Pengaturan Umum & Aplikasi</h2>
            <p className="mt-1 text-sm text-gray-500">Atur identitas dan status operasional situs Anda.</p>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="site_name" value="Nama Aplikasi" />
                    <TextInput id="site_name" value={data.site_name} onChange={e => setData('site_name', e.target.value)} className="mt-1 block w-full md:w-2/3" />
                    <InputError message={errors.site_name} className="mt-2" />
                </div>

                <div className="p-4 border rounded-md flex items-center justify-between">
                    <div>
                        <h3 className="text-md font-medium">Mode Maintenance</h3>
                        <p className="text-sm text-gray-500">Jika aktif, hanya admin yang bisa mengakses situs.</p>
                    </div>
                    <Switch
                        checked={data.maintenance_mode}
                        onChange={value => setData('maintenance_mode', value)}
                        className={`${data.maintenance_mode ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                    >
                        <span className={`${data.maintenance_mode ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                    </Switch>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="logo" value="Logo Aplikasi (PNG, JPG, WEBP, maks 1MB)" />
                        <input type="file" onChange={e => setData('logo', e.target.files[0])} className="mt-1 block w-full text-sm" />
                        {get(settings, 'logo') && !data.logo && <img src={`/storage/${get(settings, 'logo')}`} alt="Current Logo" className="h-12 mt-2 bg-gray-100 p-1 rounded" />}
                        <InputError message={errors.logo} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="favicon" value="Favicon (ICO/PNG, maks 256KB)" />
                        <input type="file" onChange={e => setData('favicon', e.target.files[0])} className="mt-1 block w-full text-sm" />
                        {get(settings, 'favicon') && !data.favicon && <img src={`/storage/${get(settings, 'favicon')}`} alt="Current Favicon" className="h-8 mt-2" />}
                        <InputError message={errors.favicon} className="mt-2" />
                    </div>
                </div>

                <div className="flex justify-end">
                    <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                </div>
            </form>
        </div>
    );
};

/* ---------------- Booking Form ---------------- */
const BookingSettingsForm = ({ settings }) => {
    const { data, setData, put, processing, errors } = useForm({
        min_rental_days: get(settings, 'min_rental_days', 1),
        max_rental_days: get(settings, 'max_rental_days', 30),
        booking_buffer_hours: get(settings, 'booking_buffer_hours', 2),
        auto_confirm_payment: get(settings, 'auto_confirm_payment', false),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800">Pemesanan & Ketersediaan</h2>
            <p className="mt-1 text-sm text-gray-500">Atur aturan dan otomatisasi terkait proses pemesanan.</p>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <InputLabel htmlFor="min_rental_days" value="Minimum Hari Sewa" />
                        <TextInput type="number" id="min_rental_days" value={data.min_rental_days} onChange={e => setData('min_rental_days', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.min_rental_days} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="max_rental_days" value="Maksimum Hari Sewa" />
                        <TextInput type="number" id="max_rental_days" value={data.max_rental_days} onChange={e => setData('max_rental_days', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.max_rental_days} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="booking_buffer_hours" value="Buffer Antar Pesanan (Jam)" />
                        <TextInput type="number" id="booking_buffer_hours" value={data.booking_buffer_hours} onChange={e => setData('booking_buffer_hours', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.booking_buffer_hours} className="mt-2" />
                    </div>
                </div>

                <div className="p-4 border rounded-md flex items-center justify-between">
                    <div>
                        <h3 className="text-md font-medium">Konfirmasi Otomatis</h3>
                        <p className="text-sm text-gray-500">Otomatis konfirmasi pesanan jika pembayaran sukses.</p>
                    </div>
                    <Switch checked={data.auto_confirm_payment} onChange={value => setData('auto_confirm_payment', value)} className={`${data.auto_confirm_payment ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}>
                        <span className={`${data.auto_confirm_payment ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                    </Switch>
                </div>

                <div className="flex justify-end">
                    <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                </div>
            </form>
        </div>
    );
};

/* ---------------- Payment Form ---------------- */
const PaymentSettingsForm = ({ settings }) => {
    const initialMethods = Array.isArray(get(settings, 'payment_methods', [])) ? get(settings, 'payment_methods', []) : (get(settings, 'payment_methods') ? JSON.parse(get(settings, 'payment_methods')) : []);
    const { data, setData, put, processing, errors } = useForm({
        tax_percent: get(settings, 'tax_percent', 0),
        service_fee_type: get(settings, 'service_fee_type', 'fixed'),
        service_fee_value: get(settings, 'service_fee_value', 0),
        payment_methods: initialMethods,
        stripe_secret_key: '',
        midtrans_server_key: '',
        auto_verify_webhook: get(settings, 'auto_verify_webhook', false),
    });

    const toggleMethod = (method) => {
        const current = new Set(data.payment_methods || []);
        if (current.has(method)) current.delete(method);
        else current.add(method);
        setData('payment_methods', Array.from(current));
    };

    const submit = (e) => {
        e.preventDefault();
        // send as PUT; controller will json_encode arrays
        put(route('admin.settings.update'), { preserveScroll: true });
    };

    const methods = ['cash', 'transfer', 'ewallet', 'midtrans', 'stripe'];

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800">Pembayaran</h2>
            <p className="mt-1 text-sm text-gray-500">Konfigurasi pajak, fee, dan gateway pembayaran.</p>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <InputLabel htmlFor="tax_percent" value="Pajak (%)" />
                        <TextInput type="number" id="tax_percent" value={data.tax_percent} onChange={e => setData('tax_percent', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.tax_percent} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="service_fee_value" value="Biaya Layanan" />
                        <div className="flex gap-2">
                            <select value={data.service_fee_type} onChange={e => setData('service_fee_type', e.target.value)} className="mt-1 block px-3 py-2 border rounded">
                                <option value="fixed">Fixed</option>
                                <option value="percentage">Percentage (%)</option>
                            </select>
                            <TextInput type="number" id="service_fee_value" value={data.service_fee_value} onChange={e => setData('service_fee_value', e.target.value)} className="mt-1 block w-full" />
                        </div>
                        <InputError message={errors.service_fee_value} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel value="Metode Pembayaran Aktif" />
                    <div className="mt-2 flex gap-4 flex-wrap">
                        {methods.map(m => (
                            <label key={m} className="inline-flex items-center gap-2">
                                <input type="checkbox" checked={(data.payment_methods || []).includes(m)} onChange={() => toggleMethod(m)} />
                                <span className="capitalize">{m.replace('_', ' ')}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="stripe_secret_key" value="Stripe Secret Key (masked)" />
                        <TextInput id="stripe_secret_key" type="password" value={data.stripe_secret_key} onChange={e => setData('stripe_secret_key', e.target.value)} className="mt-1 block w-full" placeholder="Isi hanya jika ingin mengganti" />
                        <InputError message={errors.stripe_secret_key} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="midtrans_server_key" value="Midtrans Server Key (masked)" />
                        <TextInput id="midtrans_server_key" type="password" value={data.midtrans_server_key} onChange={e => setData('midtrans_server_key', e.target.value)} className="mt-1 block w-full" placeholder="Isi hanya jika ingin mengganti" />
                        <InputError message={errors.midtrans_server_key} className="mt-2" />
                    </div>
                </div>

                <div className="p-4 border rounded-md flex items-center justify-between">
                    <div>
                        <h3 className="text-md font-medium">Auto Verify Webhook</h3>
                        <p className="text-sm text-gray-500">Secara otomatis verifikasi pembayaran yang diterima dari webhook gateway.</p>
                    </div>
                    <Switch checked={data.auto_verify_webhook} onChange={val => setData('auto_verify_webhook', val)} className={`${data.auto_verify_webhook ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 rounded-full`}>
                        <span className={`${data.auto_verify_webhook ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white`} />
                    </Switch>
                </div>

                <div className="flex justify-end">
                    <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                </div>
            </form>
        </div>
    );
};

/* ---------------- Notifications Form ---------------- */
const NotificationsSettingsForm = ({ settings }) => {
    const { data, setData, put, processing, errors } = useForm({
        smtp_host: get(settings, 'smtp_host', ''),
        smtp_port: get(settings, 'smtp_port', 587),
        smtp_user: get(settings, 'smtp_user', ''),
        smtp_pass: '',
        email_from_address: get(settings, 'email_from_address', ''),
        email_from_name: get(settings, 'email_from_name', ''),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800">Notifikasi & Email</h2>
            <p className="mt-1 text-sm text-gray-500">Konfigurasi SMTP & template notifikasi.</p>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="smtp_host" value="SMTP Host" />
                        <TextInput id="smtp_host" value={data.smtp_host} onChange={e => setData('smtp_host', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.smtp_host} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="smtp_port" value="SMTP Port" />
                        <TextInput id="smtp_port" type="number" value={data.smtp_port} onChange={e => setData('smtp_port', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.smtp_port} className="mt-2" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="smtp_user" value="SMTP User" />
                        <TextInput id="smtp_user" value={data.smtp_user} onChange={e => setData('smtp_user', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.smtp_user} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="smtp_pass" value="SMTP Password (masked)" />
                        <TextInput id="smtp_pass" type="password" value={data.smtp_pass} onChange={e => setData('smtp_pass', e.target.value)} className="mt-1 block w-full" placeholder="Isi hanya jika ingin mengganti" />
                        <InputError message={errors.smtp_pass} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email_from_address" value="Email From (address)" />
                    <TextInput id="email_from_address" value={data.email_from_address} onChange={e => setData('email_from_address', e.target.value)} className="mt-1 block w-full md:w-1/2" />
                    <InputError message={errors.email_from_address} className="mt-2" />
                </div>

                <div className="flex justify-end">
                    <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                </div>
            </form>
        </div>
    );
};

/* ---------------- Security Form (settings) ---------------- */
const SecuritySettingsForm = ({ settings }) => {
    const { data, setData, put, processing, errors } = useForm({
        session_timeout: get(settings, 'session_timeout', 120),
        admin_ip_whitelist: get(settings, 'admin_ip_whitelist', ''),
    });

    const submitSecurity = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800">Keamanan & Autentikasi</h2>
            <p className="mt-1 text-sm text-gray-500">Konfigurasi keamanan untuk melindungi panel admin.</p>

            <form onSubmit={submitSecurity} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="session_timeout" value="Batas Waktu Sesi Admin (Menit)" />
                    <TextInput type="number" id="session_timeout" value={data.session_timeout} onChange={e => setData('session_timeout', e.target.value)} className="mt-1 block w-full md:w-1/2" />
                    <InputError message={errors.session_timeout} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="admin_ip_whitelist" value="IP Whitelist untuk Panel Admin" />
                    <Textarea id="admin_ip_whitelist" value={data.admin_ip_whitelist} onChange={e => setData('admin_ip_whitelist', e.target.value)} className="mt-1 block w-full md:w-2/3 min-h-[120px]" placeholder="Satu alamat IP per baris. Contoh: 192.168.1.1" />
                    <p className="text-sm text-gray-500 mt-1">Kosongkan untuk mengizinkan semua alamat IP.</p>
                    <InputError message={errors.admin_ip_whitelist} className="mt-2" />
                </div>

                <div className="flex justify-end">
                    <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                </div>
            </form>
        </div>
    );
};

/* ---------------- Change Password Form (separate useForm) ---------------- */
const ChangePasswordForm = ({ auth }) => {
    const { data, setData, put, processing, errors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPassword = (e) => {
        e.preventDefault();
        // PUT to dedicated route for changing password
        put(route('admin.settings.change_password'), { preserveScroll: true });
    };

    // Only show this form if user role is admin (frontend guard; backend also checks)
    if (!auth || (auth.user && auth.user.role !== 'admin')) {
        return null;
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-medium">Ubah Password Admin Super</h3>
            <p className="text-sm text-gray-500">Masukkan kata sandi saat ini dan kata sandi baru. Hanya user dengan role <code>admin</code> yang dapat mengubah password di sini.</p>

            <form onSubmit={submitPassword} className="mt-4 space-y-4">
                <div>
                    <InputLabel htmlFor="current_password" value="Kata Sandi Saat Ini" />
                    <TextInput id="current_password" type="password" value={data.current_password} onChange={e => setData('current_password', e.target.value)} className="mt-1 block w-full md:w-1/2" />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />
                    <TextInput id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="mt-1 block w-full md:w-1/2" />
                    <InputError message={errors.password} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi Baru" />
                    <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="mt-1 block w-full md:w-1/2" />
                </div>

                <div className="flex justify-end">
                    <PrimaryButton disabled={processing}>Ubah Password</PrimaryButton>
                </div>
            </form>
        </div>
    );
};

/* ---------------- Placeholder simple component ---------------- */
const Placeholder = ({ title }) => (
    <div className="text-gray-600">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="mt-2">Pengaturan untuk bagian ini sedang dalam pengembangan.</p>
    </div>
);

/* ---------------- Main Page ---------------- */
export default function Index({ auth, settings }) {
    const [activeTab, setActiveTab] = useState('general');

    const settingGroups = [
        { key: 'general', label: 'Umum & Aplikasi', component: <GeneralSettingsForm settings={settings} /> },
        { key: 'booking', label: 'Pemesanan & Ketersediaan', component: <BookingSettingsForm settings={settings} /> },
        { key: 'payment', label: 'Pembayaran', component: <PaymentSettingsForm settings={settings} /> },
        { key: 'notifications', label: 'Notifikasi & Email', component: <NotificationsSettingsForm settings={settings} /> },
        { key: 'security', label: 'Keamanan & Autentikasi', component: (
            <div>
                <SecuritySettingsForm settings={settings} />
                <ChangePasswordForm auth={auth} />
            </div>
        )},
        { key: 'fleet', label: 'Fleet / Mobil', component: <Placeholder title="Fleet / Mobil" /> },
        { key: 'documents', label: 'Dokumen & KYC', component: <Placeholder title="Dokumen & KYC" /> },
        { key: 'promotions', label: 'Promo & Banner', component: <Placeholder title="Promo & Banner" /> },
        { key: 'integrations', label: 'Integrasi & API', component: <Placeholder title="Integrasi & API" /> },
    ];

    return (
        <AdminLayout user={auth.user} header="Pengaturan Sistem">
            <Head title="Pengaturan Sistem" />
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4 lg:w-1/5">
                    <nav className="space-y-1">
                        {settingGroups.map(group => (
                            <button
                                key={group.key}
                                onClick={() => setActiveTab(group.key)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${activeTab === group.key ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                {group.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1">
                    <div className="bg-white p-6 rounded-lg shadow min-h-[400px]">
                        {settingGroups.find(g => g.key === activeTab)?.component}
                    </div>
                </main>
            </div>
        </AdminLayout>
    );
}

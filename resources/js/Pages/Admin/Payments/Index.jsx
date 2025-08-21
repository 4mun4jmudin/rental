import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Swal from 'sweetalert2';
import { FunnelIcon, BanknotesIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const Pagination = ({ links }) => {
    return (
        <div className="mt-6 flex justify-center">
            {links.map((link, key) => (
                link.url === null ?
                    (<div
                        key={key}
                        className="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />) :
                    (<Link
                        key={key}
                        className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded hover:bg-white focus:border-indigo-500 focus:text-indigo-500 ${link.active ? 'bg-indigo-200' : ''}`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />)
            ))}
        </div>
    );
}

const KpiCard = ({ title, value, icon }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
        <div className="flex items-center">
            <div className="flex-shrink-0">{React.createElement(icon, { className: 'h-8 w-8 text-gray-400' })}</div>
            <div className="ml-5 w-0 flex-1">
                <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
                </dl>
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const statusClasses = {
        pending: 'bg-yellow-100 text-yellow-800',
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const FilterPanel = ({ filters }) => {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        status: filters.status || '',
        method: filters.method || '',
    });

    // PERBAIKAN DI SINI: Gunakan block body `{}` untuk arrow function
    const applyFilters = (e) => {
        e.preventDefault();
        get(route('admin.payments.index'), {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <form onSubmit={applyFilters} className="p-4 mb-4 bg-gray-50 rounded-lg border grid grid-cols-1 md:grid-cols-5 gap-4">
            <TextInput type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
            <TextInput type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
            <select value={data.status} onChange={e => setData('status', e.target.value)} className="border-gray-300 rounded-md shadow-sm">
                <option value="">Semua Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
            </select>
            <select value={data.method} onChange={e => setData('method', e.target.value)} className="border-gray-300 rounded-md shadow-sm">
                <option value="">Semua Metode</option>
                <option value="transfer">Transfer</option>
                <option value="cash">Cash</option>
                <option value="ewallet">E-Wallet</option>
            </select>
            <PrimaryButton type="submit" disabled={processing} className="justify-center">
                <FunnelIcon className="w-5 h-5 mr-2" /> Filter
            </PrimaryButton>
        </form>
    );
};

export default function Index({ auth, payments, kpis, filters }) {

    const updateStatus = (payment, newStatus) => {
        Swal.fire({
            title: 'Konfirmasi Aksi',
            text: `Anda yakin ingin mengubah status pembayaran untuk Pesanan #${payment.booking_id} menjadi ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Batal',
            confirmButtonText: 'Ya, Ubah!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('admin.payments.update', payment.id), { status: newStatus }, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Berhasil!', 'Status pembayaran telah diubah.', 'success'),
                });
            }
        });
    };

    return (
        <AdminLayout user={auth.user} header="Manajemen Keuangan">
            <Head title="Manajemen Keuangan" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <KpiCard title="Total Pendapatan" value={`Rp ${new Intl.NumberFormat('id-ID').format(kpis.total_revenue)}`} icon={BanknotesIcon} />
                <KpiCard title="Jumlah Tertunda" value={`Rp ${new Intl.NumberFormat('id-ID').format(kpis.pending_amount)}`} icon={ClockIcon} />
                <KpiCard title="Total Transaksi" value={kpis.total_transactions} icon={CheckCircleIcon} />
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <h2 className="text-xl font-semibold mb-4">Daftar Transaksi</h2>
                    <FilterPanel filters={filters} />
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna & Mobil</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Transaksi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Bayar</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.data.map(payment => (
                                    <tr key={payment.id}>
                                        <td className="px-6 py-4 font-mono">#{payment.booking_id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{payment.booking?.user?.full_name || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{payment.booking?.car?.brand} {payment.booking?.car?.model || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">Rp {new Intl.NumberFormat('id-ID').format(payment.amount)}</td>
                                        <td className="px-6 py-4 capitalize">{payment.payment_method}</td>
                                        <td className="px-6 py-4"><StatusBadge status={payment.status} /></td>
                                        <td className="px-6 py-4 font-mono text-xs">{payment.transaction_id || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">{payment.paid_at ? format(parseISO(payment.paid_at), 'dd MMM yyyy, HH:mm', { locale: id }) : 'Belum dibayar'}</td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {payment.status === 'pending' && (
                                                <button onClick={() => updateStatus(payment, 'success')} className="text-green-600 hover:text-green-900">
                                                    Tandai Sukses
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={payments.links} />
                </div>
            </div>
        </AdminLayout>
    );
}
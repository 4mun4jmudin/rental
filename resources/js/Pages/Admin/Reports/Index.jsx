import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { BanknotesIcon, CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler // <-- 1. IMPORT THE FILLER PLUGIN
} from 'chart.js';
import { format, subDays } from 'date-fns';

// Registrasi Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler // <-- 2. REGISTER THE FILLER PLUGIN
);

// Komponen Kartu KPI
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

// Komponen Utama
export default function Index({ auth, kpis, revenueChartData, bookingStatusChartData, bookingDetails, filters }) {
    const { data, setData, get } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
    });

    const setDateRange = (days) => {
        const endDate = new Date();
        const startDate = subDays(endDate, days - 1);
        const newFilters = {
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd'),
        };
        setData(newFilters);
        router.get(route('admin.reports.index'), newFilters, { preserveState: true, replace: true });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        get(route('admin.reports.index'), { preserveState: true, replace: true });
    };

    // Siapkan data untuk Chart
    const revenueData = {
        labels: Object.keys(revenueChartData).map(date => format(new Date(date), 'dd MMM')),
        datasets: [{
            label: 'Pendapatan (Rp)',
            data: Object.values(revenueChartData),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.1,
        }],
    };

    const bookingStatusData = {
        labels: Object.keys(bookingStatusChartData),
        datasets: [{
            data: Object.values(bookingStatusChartData),
            backgroundColor: ['#f59e0b', '#3b82f6', '#16a34a', '#ef4444'], // Sesuai urutan: pending, confirmed, completed, cancelled
        }],
    };

    return (
        <AdminLayout user={auth.user} header="Laporan & Analitik">
            <Head title="Laporan & Analitik" />

            {/* Date Range Picker & Presets */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="border-gray-300 rounded-md shadow-sm" />
                        <span className="text-gray-500">sampai</span>
                        <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="border-gray-300 rounded-md shadow-sm" />
                        <PrimaryButton type="submit">Terapkan</PrimaryButton>
                    </div>
                    <div className="flex items-center gap-2 border-l pl-4 ml-2">
                        <SecondaryButton type="button" onClick={() => setDateRange(7)}>7 Hari Terakhir</SecondaryButton>
                        <SecondaryButton type="button" onClick={() => setDateRange(30)}>30 Hari Terakhir</SecondaryButton>
                    </div>
                </form>
            </div>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <KpiCard title="Total Pendapatan" value={`Rp ${new Intl.NumberFormat('id-ID').format(kpis.total_revenue)}`} icon={BanknotesIcon} />
                <KpiCard title="Total Pesanan" value={kpis.total_bookings} icon={CalendarDaysIcon} />
                <KpiCard title="Rata-rata Pendapatan Harian" value={`Rp ${new Intl.NumberFormat('id-ID').format(kpis.avg_daily_rate)}`} icon={ChartBarIcon} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow">
                    <h3 className="font-semibold mb-4">Grafik Pendapatan</h3>
                    <Line data={revenueData} />
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="font-semibold mb-4">Status Pesanan</h3>
                    <Pie data={bookingStatusData} />
                </div>
            </div>

            {/* Data Table */}
            <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="font-semibold mb-4">Rincian Pesanan dalam Periode Terpilih</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobil</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Harga</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookingDetails.data.map(booking => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 font-mono">#{booking.id}</td>
                                    <td className="px-6 py-4">{booking.user.full_name}</td>
                                    <td className="px-6 py-4">{booking.car.brand} {booking.car.model}</td>
                                    <td className="px-6 py-4">Rp {new Intl.NumberFormat('id-ID').format(booking.total_price)}</td>
                                    <td className="px-6 py-4 capitalize">{booking.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {/* <Pagination links={bookingDetails.links} /> */}
            </div>

        </AdminLayout>
    );
}
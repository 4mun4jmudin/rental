import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout'; // Impor layout utama
import { Head, Link } from '@inertiajs/react';
import {
    BanknotesIcon,
    CalendarDaysIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Registrasi komponen Chart.js (hanya perlu sekali)
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Komponen kecil untuk Kartu KPI (Key Performance Indicator)
const KpiCard = ({ title, value, icon }) => (
    <div className="overflow-hidden rounded-lg bg-white p-5 shadow">
        <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
                {React.createElement(icon, { className: 'h-6 w-6 text-white' })}
            </div>
            <div className="ml-5 w-0 flex-1">
                <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
                    <dd>
                        <div className="text-lg font-medium text-gray-900">{value}</div>
                    </dd>
                </dl>
            </div>
        </div>
    </div>
);

// Komponen utama halaman dasbor
export default function DashboardIndex({ auth, kpi, bookingTrend, popularCars, recentActivities, actionableItems }) {
    
    // Data untuk Grafik Tren Pesanan
    const bookingTrendData = {
        labels: Object.keys(bookingTrend),
        datasets: [{
            label: 'Pesanan per Hari',
            data: Object.values(bookingTrend),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    // Data untuk Grafik Mobil Populer
    const popularCarsData = {
        labels: Object.keys(popularCars),
        datasets: [{
            label: 'Jumlah Pesanan',
            data: Object.values(popularCars),
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
            ],
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <AdminLayout user={auth.user} header="Halaman Utama">
            <Head title="Dashboard Admin" />

            <div className="space-y-8">
                {/* Bagian KPI Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard title="Pendapatan Hari Ini" value={`Rp ${new Intl.NumberFormat('id-ID').format(kpi.revenue_today || 0)}`} icon={BanknotesIcon} />
                    <KpiCard title="Pendapatan Bulan Ini" value={`Rp ${new Intl.NumberFormat('id-ID').format(kpi.revenue_month || 0)}`} icon={BanknotesIcon} />
                    <KpiCard title="Pesanan Baru Hari Ini" value={kpi.new_bookings_today} icon={CalendarDaysIcon} />
                    <KpiCard title="Pengguna Baru Hari Ini" value={kpi.new_users_today} icon={UserPlusIcon} />
                </div>

                {/* Bagian Grafik */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-lg bg-white p-5 shadow lg:col-span-2">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Tren Pesanan 7 Hari Terakhir</h3>
                        <div className="mt-4">
                            <Line options={chartOptions} data={bookingTrendData} />
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Mobil Terpopuler</h3>
                        <div className="mt-4">
                            <Pie data={popularCarsData} />
                        </div>
                    </div>
                </div>

                {/* Bagian Aktivitas & Tugas */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-lg bg-white p-5 shadow">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Aktivitas Terbaru</h3>
                        <ul role="list" className="mt-4 divide-y divide-gray-200">
                            {recentActivities.map((activity, index) => (
                                <li key={index} className="py-3 text-sm text-gray-600">
                                    {activity}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Perlu Tindakan</h3>
                        <ul role="list" className="mt-4 divide-y divide-gray-200">
                             {actionableItems.map((item, index) => (
                                <li key={index} className="flex items-center justify-between py-3 text-sm">
                                    <p className="text-gray-700">{item.text}</p>
                                    <Link href={item.href} className="font-semibold text-indigo-600 hover:text-indigo-800">Lihat</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

// Ikon
import { FunnelIcon, CalendarDaysIcon, Bars3Icon, EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/20/solid';

// Library
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';


// --- SUB-KOMPONEN ---

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
};
const StatusBadge = ({ status }) => {
    const statusClasses = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        success: 'bg-green-100 text-green-800', // Untuk pembayaran
        failed: 'bg-red-100 text-red-800', // Untuk pembayaran
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const FilterPanel = ({ cars, users, filters }) => {
    const { data, setData, get, processing, reset } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        status: filters.status || '',
        payment_status: filters.payment_status || '',
        car_id: filters.car_id || '',
    });

    const applyFilters = (e) => {
        e.preventDefault();
        get(route('admin.bookings.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        reset();
        router.get(route('admin.bookings.index'));
    };

    return (
        <div className="p-4 mb-4 bg-gray-50 rounded-lg border">
            <form onSubmit={applyFilters}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <TextInput type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} title="Tanggal Mulai Dari" />
                    <TextInput type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} title="Tanggal Selesai Sampai" />
                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="border-gray-300 rounded-md shadow-sm">
                        <option value="">Semua Status Pesanan</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select value={data.payment_status} onChange={e => setData('payment_status', e.target.value)} className="border-gray-300 rounded-md shadow-sm">
                        <option value="">Semua Status Bayar</option>
                        <option value="pending">Pending</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select value={data.car_id} onChange={e => setData('car_id', e.target.value)} className="border-gray-300 rounded-md shadow-sm">
                        <option value="">Semua Mobil</option>
                        {cars.map(car => <option key={car.id} value={car.id}>{car.brand} {car.model}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <PrimaryButton type="submit" disabled={processing} className="w-full justify-center">Filter</PrimaryButton>
                        <SecondaryButton onClick={clearFilters} type="button" className="w-full justify-center">Reset</SecondaryButton>
                    </div>
                </div>
            </form>
        </div>
    );
};

const BookingsCalendar = ({ onEventClick }) => {
    const [events, setEvents] = useState([]);
    useEffect(() => {
        axios.get(route('admin.bookings.index', { view: 'calendar' }))
            .then(response => {
                const formattedEvents = response.data.map(booking => ({
                    id: booking.id,
                    title: `${booking.car.brand} ${booking.car.model}`,
                    start: booking.start_date,
                    end: format(parseISO(booking.end_date).setDate(parseISO(booking.end_date).getDate() + 1), 'yyyy-MM-dd'),
                    backgroundColor: booking.status === 'completed' ? '#16a34a' : booking.status === 'confirmed' ? '#4f46e5' : '#f59e0b',
                    borderColor: booking.status === 'completed' ? '#16a34a' : booking.status === 'confirmed' ? '#4f46e5' : '#f59e0b',
                    extendedProps: { user: booking.user.full_name }
                }));
                setEvents(formattedEvents);
            });
    }, []);

    return <FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" events={events} eventClick={(info) => onEventClick(info.event.id)} eventContent={(arg) => (
        <>
            <b>{arg.timeText}</b>
            <i className="ml-1">{arg.event.title}</i>
            <div className="text-xs">{arg.event.extendedProps.user}</div>
        </>
    )} />;
};

const CreateBookingModal = ({ show, onClose, cars, users }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        car_id: '',
        start_date: '',
        end_date: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.bookings.store'), {
            onSuccess: () => {
                reset();
                onClose();
                Swal.fire('Berhasil!', 'Pesanan baru telah dibuat.', 'success');
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Buat Pesanan Manual</h2>
                <div className="mt-6 space-y-4">
                    <div>
                        <InputLabel htmlFor="user_id" value="Pilih Pengguna" />
                        <select id="user_id" value={data.user_id} onChange={e => setData('user_id', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option value="">-- Pilih Pengguna --</option>
                            {users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
                        </select>
                        <InputError message={errors.user_id} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="car_id" value="Pilih Mobil" />
                        <select id="car_id" value={data.car_id} onChange={e => setData('car_id', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option value="">-- Pilih Mobil --</option>
                            {cars.map(car => <option key={car.id} value={car.id}>{car.brand} {car.model}</option>)}
                        </select>
                        <InputError message={errors.car_id} className="mt-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="start_date" value="Tanggal Mulai" />
                            <TextInput type="date" id="start_date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.start_date} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="end_date" value="Tanggal Selesai" />
                            <TextInput type="date" id="end_date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.end_date} className="mt-2" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Batal</SecondaryButton>
                    <PrimaryButton className="ml-3" disabled={processing}>Buat Pesanan</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
};


// --- KOMPONEN UTAMA ---

export default function Index({ auth, bookings, cars, users, filters }) {
    const [view, setView] = useState('list');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const changeStatus = (booking, newStatus) => {
        router.put(route('admin.bookings.update', booking.id), { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => Swal.fire('Berhasil!', 'Status pesanan telah diperbarui.', 'success'),
            onError: () => Swal.fire('Gagal!', 'Terjadi kesalahan saat memperbarui status.', 'error'),
        });
    };

    const deleteBooking = (booking) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Anda akan menghapus pesanan #${booking.id}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonText: 'Batal',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.bookings.destroy', booking.id), {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Terhapus!', 'Pesanan telah dihapus.', 'success')
                });
            }
        });
    };

    return (
        <AdminLayout user={auth.user} header="Manajemen Pesanan">
            <Head title="Manajemen Pesanan" />
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold">Daftar Pesanan</h2>
                            <div className="flex rounded-md shadow-sm">
                                <button onClick={() => setView('list')} className={`px-3 py-2 text-sm font-medium border rounded-l-md ${view === 'list' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}><Bars3Icon className="w-5 h-5" /></button>
                                <button onClick={() => setView('calendar')} className={`-ml-px px-3 py-2 text-sm font-medium border rounded-r-md ${view === 'calendar' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}><CalendarDaysIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <PrimaryButton onClick={() => setShowCreateModal(true)}>Buat Pesanan Manual</PrimaryButton>
                    </div>

                    {view === 'list' && (
                        <>
                            <FilterPanel cars={cars} users={users} filters={filters} />
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobil</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Harga</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Pesanan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Bayar</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {bookings.data.map(booking => (
                                            <tr key={booking.id}>
                                                <td className="px-6 py-4 font-mono text-sm">#{booking.id}</td>
                                                <td className="px-6 py-4">{booking.user.full_name}</td>
                                                <td className="px-6 py-4">{booking.car.brand} {booking.car.model}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    {format(parseISO(booking.start_date), 'dd MMM yyyy', { locale: id })}
                                                    <span className="block text-xs text-gray-500">{booking.rental_days} hari</span>
                                                </td>
                                                <td className="px-6 py-4">Rp {new Intl.NumberFormat('id-ID').format(booking.total_price)}</td>
                                                <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                                                <td className="px-6 py-4"><StatusBadge status={booking.payment?.status || 'pending'} /></td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="flex items-center gap-3">
                                                        {booking.status === 'pending' && <button onClick={() => changeStatus(booking, 'confirmed')} className="text-green-600 hover:text-green-900" title="Confirm Booking"><CheckCircleIcon className="w-5 h-5" /></button>}
                                                        {booking.status === 'confirmed' && <button onClick={() => changeStatus(booking, 'completed')} className="text-blue-600 hover:text-blue-900" title="Mark as Completed"><CheckCircleIcon className="w-5 h-5" /></button>}
                                                        {booking.status !== 'completed' && booking.status !== 'cancelled' && <button onClick={() => changeStatus(booking, 'cancelled')} className="text-yellow-600 hover:text-yellow-900" title="Cancel Booking"><XCircleIcon className="w-5 h-5" /></button>}
                                                        <button onClick={() => deleteBooking(booking)} className="text-red-600 hover:text-red-900" title="Delete Booking"><TrashIcon className="w-5 h-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* <Pagination links={bookings.links} /> */}
                        </>
                    )}

                    {view === 'calendar' && <BookingsCalendar onEventClick={(id) => console.log('View Booking #' + id)} />}
                </div>
            </div>

            <CreateBookingModal show={showCreateModal} onClose={() => setShowCreateModal(false)} cars={cars} users={users} />

        </AdminLayout>
    );
}
import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
import { StarIcon, FunnelIcon } from '@heroicons/react/20/solid';
import TextInput from '@/Components/TextInput';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Komponen Paginasi
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

// Daftar fitur yang bisa dipilih untuk filter
const featuresList = ['AC', 'GPS', 'Bluetooth', 'USB Port', 'Child Seat', 'Sunroof'];

// Komponen Panel Filter
const FilterPanel = ({ brands, filters }) => {
    const { data, setData, get, processing, reset } = useForm({
        search: filters.search || '',
        status: filters.status || '',
        brand: filters.brand || '',
        features: filters.features || [],
    });

    const handleFeatureChange = (feature) => {
        setData('features', data.features.includes(feature)
            ? data.features.filter(f => f !== feature)
            : [...data.features, feature]
        );
    };

    const applyFilters = (e) => {
        e.preventDefault();
        get(route('admin.cars.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        reset();
        router.get(route('admin.cars.index'));
    };

    return (
        <div className="p-4 mb-4 bg-gray-50 rounded-lg border">
            <form onSubmit={applyFilters}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    <TextInput placeholder="Cari model, brand, plat..." value={data.search} onChange={e => setData('search', e.target.value)} />
                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                        <option value="">Semua Status</option>
                        <option value="available">Tersedia</option>
                        <option value="rented">Disewa</option>
                        <option value="maintenance">Perawatan</option>
                    </select>
                    <select value={data.brand} onChange={e => setData('brand', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                        <option value="">Semua Brand</option>
                        {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <PrimaryButton type="submit" disabled={processing} className="w-full justify-center">
                            <FunnelIcon className="w-5 h-5 mr-2" /> Terapkan
                        </PrimaryButton>
                         <SecondaryButton onClick={clearFilters} type="button" className="w-full justify-center">
                            Reset
                        </SecondaryButton>
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                    {featuresList.map(feature => (
                        <label key={feature} className="flex items-center text-sm">
                            <input type="checkbox" checked={data.features.includes(feature)} onChange={() => handleFeatureChange(feature)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                            <span className="ml-2 text-gray-700">{feature}</span>
                        </label>
                    ))}
                </div>
            </form>
        </div>
    );
};

// Komponen utama halaman daftar mobil
export default function Index({ auth, cars, brands, filters }) {
    const [selectedCars, setSelectedCars] = useState([]);

    const handleSelectCar = (carId) => {
        setSelectedCars(prev => 
            prev.includes(carId) ? prev.filter(id => id !== carId) : [...prev, carId]
        );
    };

    const handleSelectAll = (e) => {
        setSelectedCars(e.target.checked ? cars.data.map(c => c.id) : []);
    };

    const handleDelete = (car) => {
        Swal.fire({
            title: 'Apakah Anda Yakin?',
            text: `Anda akan menghapus mobil ${car.brand} ${car.model}. Aksi ini tidak dapat dibatalkan!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.cars.destroy', car.id), {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Mobil telah berhasil dihapus.', 'success');
                        setSelectedCars([]);
                    }
                });
            }
        });
    };

    const handleBulkUpdate = (status) => {
        if (selectedCars.length === 0) {
            Swal.fire('Peringatan', 'Pilih setidaknya satu mobil untuk diperbarui.', 'warning');
            return;
        }
        router.post(route('admin.cars.bulkUpdateStatus'), {
            ids: selectedCars,
            status: status,
        }, {
            onSuccess: () => {
                Swal.fire('Berhasil!', `${selectedCars.length} mobil telah diperbarui.`, 'success');
                setSelectedCars([]);
            },
            preserveState: false, // Muat ulang data dari server
        });
    };

    return (
        <AdminLayout user={auth.user} header="Manajemen Armada">
            <Head title="Manajemen Armada" />
            
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Daftar Mobil</h2>
                        <Link href={route('admin.cars.create')}>
                            <PrimaryButton>Tambah Mobil</PrimaryButton>
                        </Link>
                    </div>

                    <FilterPanel brands={brands} filters={filters} />

                    {selectedCars.length > 0 && (
                        <div className="p-3 mb-4 bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-4">
                            <span className="text-sm font-medium text-indigo-800">{selectedCars.length} mobil dipilih.</span>
                            <button onClick={() => handleBulkUpdate('available')} className="text-sm font-semibold text-green-700 hover:underline">Set Tersedia</button>
                            <button onClick={() => handleBulkUpdate('maintenance')} className="text-sm font-semibold text-yellow-700 hover:underline">Set Perawatan</button>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left"><input type="checkbox" onChange={handleSelectAll} checked={cars.data.length > 0 && selectedCars.length === cars.data.length} /></th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gambar</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand & Model</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Polisi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga/Hari</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cars.data.map((car) => (
                                    <tr key={car.id} className={selectedCars.includes(car.id) ? 'bg-indigo-50' : ''}>
                                        <td className="px-6 py-4"><input type="checkbox" checked={selectedCars.includes(car.id)} onChange={() => handleSelectCar(car.id)} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {car.image_urls && car.image_urls[0] ? 
                                                <img src={`/storage/${car.image_urls[0]}`} alt={`${car.brand} ${car.model}`} className="w-20 h-12 object-cover rounded"/> :
                                                <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{car.brand} {car.model}</div>
                                            <div className="text-sm text-gray-500">{car.year}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono">{car.license_plate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">Rp {new Intl.NumberFormat('id-ID').format(car.price_per_day)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                car.status === 'available' ? 'bg-green-100 text-green-800' :
                                                car.status === 'rented' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>{car.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <StarIcon className="h-5 w-5 text-yellow-400" />
                                                <span className="ml-1 text-sm text-gray-600">{parseFloat(car.reviews_avg_rating || 0).toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link href={route('admin.cars.edit', car.id)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold">Edit</Link>
                                            <button onClick={() => handleDelete(car)} className="text-red-600 hover:text-red-900 font-semibold">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                                {cars.data.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada mobil yang ditemukan. Coba ubah filter Anda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <Pagination links={cars.links} />

                </div>
            </div>
        </AdminLayout>
    );
}
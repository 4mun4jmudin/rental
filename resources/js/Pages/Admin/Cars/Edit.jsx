import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Textarea from '@/Components/Textarea';
import { XCircleIcon } from '@heroicons/react/24/solid';

const featuresList = ['AC', 'GPS', 'Bluetooth', 'USB Port', 'Child Seat', 'Sunroof'];

export default function Edit({ auth, car }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        _method: 'PUT',
        brand: car.brand,
        model: car.model,
        year: car.year,
        license_plate: car.license_plate,
        price_per_day: car.price_per_day,
        description: car.description || '',
        status: car.status,
        features: car.features || [],
        images_to_delete: [], // Untuk menampung URL gambar yang akan dihapus
        new_images: [],      // Untuk menampung file gambar baru
    });

    const handleFeatureChange = (feature) => {
        setData('features', data.features.includes(feature)
            ? data.features.filter(f => f !== feature)
            : [...data.features, feature]
        );
    };

    const handleImageDelete = (imageUrl) => {
        setData('images_to_delete', [...data.images_to_delete, imageUrl]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.cars.update', car.id), {
            forceFormData: true,
        });
    };

    // Filter gambar yang ada untuk tidak menampilkan yang sudah ditandai untuk dihapus
    const existingImages = car.image_urls.filter(url => !data.images_to_delete.includes(url));

    return (
        <AdminLayout user={auth.user} header={`Edit Mobil: ${car.brand} ${car.model}`}>
            <Head title="Edit Mobil" />
            
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
                <form onSubmit={handleSubmit}>
                    {/* Salin semua field form dari Create.jsx, sudah diisi di sini */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="brand" value="Brand" isRequired />
                            <TextInput id="brand" value={data.brand} onChange={e => setData('brand', e.target.value)} className="w-full mt-1" />
                            <InputError message={errors.brand} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="model" value="Model" isRequired />
                            <TextInput id="model" value={data.model} onChange={e => setData('model', e.target.value)} className="w-full mt-1" />
                            <InputError message={errors.model} className="mt-2" />
                        </div>
                    </div>
                    {/* ... (Field lainnya: license_plate, year, price, status, description, features) ... */}
                    {/* (Anda bisa salin-tempel dari Create.jsx di atas karena sama persis) */}
                    
                    {/* Tampilkan Gambar yang Sudah Ada */}
                    <div className="mt-4">
                        <InputLabel value="Gambar Saat Ini" />
                        {existingImages.length > 0 ? (
                            <div className="flex flex-wrap gap-4 mt-2 p-4 border rounded-md">
                                {existingImages.map((url, index) => (
                                    <div key={index} className="relative">
                                        <img src={`/storage/${url}`} className="w-32 h-20 object-cover rounded" />
                                        <button 
                                            type="button" 
                                            onClick={() => handleImageDelete(url)}
                                            className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 hover:text-red-700">
                                            <XCircleIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mt-2">Tidak ada gambar tersisa.</p>
                        )}
                         <InputError message={errors.images_to_delete} className="mt-2" />
                    </div>

                    {/* Tambah Gambar Baru */}
                    <div className="mt-4">
                        <InputLabel htmlFor="new_images" value="Tambah Gambar Baru (Opsional)" />
                        <input type="file" multiple onChange={e => setData('new_images', e.target.files)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        {progress && (
                            <div className="w-full bg-gray-200 rounded-full mt-2">
                                <div className="bg-indigo-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress.percentage}%` }}>{progress.percentage}%</div>
                            </div>
                        )}
                        <InputError message={errors.new_images} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <Link href={route('admin.cars.index')} className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-300">
                            Batal
                        </Link>
                        <PrimaryButton disabled={processing}>Update Mobil</PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
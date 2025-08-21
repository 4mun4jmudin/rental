import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Textarea from '@/Components/Textarea';

// Daftar fitur yang bisa dipilih
const featuresList = ['AC', 'GPS', 'Bluetooth', 'USB Port', 'Child Seat', 'Sunroof'];

export default function Create({ auth }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        brand: '',
        model: '',
        year: '',
        license_plate: '',
        price_per_day: '',
        description: '',
        status: 'available',
        features: [],
        image_files: [], // Akan menampung file gambar yang diupload
    });

    const handleFeatureChange = (feature) => {
        const currentFeatures = data.features;
        if (currentFeatures.includes(feature)) {
            setData('features', currentFeatures.filter(f => f !== feature));
        } else {
            setData('features', [...currentFeatures, feature]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.cars.store'), {
            forceFormData: true, // Wajib untuk upload file
        });
    };

    return (
        <AdminLayout user={auth.user} header="Tambah Mobil Baru">
            <Head title="Tambah Mobil" />
            
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
                <form onSubmit={handleSubmit}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <InputLabel htmlFor="license_plate" value="Nomor Polisi" isRequired />
                            <TextInput id="license_plate" value={data.license_plate} onChange={e => setData('license_plate', e.target.value.toUpperCase())} className="w-full mt-1" placeholder="B 1234 ABC" />
                            <InputError message={errors.license_plate} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="year" value="Tahun" isRequired />
                            <TextInput type="number" id="year" value={data.year} onChange={e => setData('year', e.target.value)} className="w-full mt-1" placeholder="2024" />
                            <InputError message={errors.year} className="mt-2" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <InputLabel htmlFor="price_per_day" value="Harga per Hari (Rp)" isRequired />
                            <TextInput type="number" id="price_per_day" value={data.price_per_day} onChange={e => setData('price_per_day', e.target.value)} className="w-full mt-1" placeholder="350000" />
                            <InputError message={errors.price_per_day} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="status" value="Status" isRequired />
                            <select id="status" value={data.status} onChange={e => setData('status', e.target.value)} className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                                <option value="available">Tersedia (Available)</option>
                                <option value="rented">Disewa (Rented)</option>
                                <option value="maintenance">Perawatan (Maintenance)</option>
                            </select>
                            <InputError message={errors.status} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="description" value="Deskripsi" />
                        <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} className="w-full mt-1" />
                        <InputError message={errors.description} className="mt-2" />
                    </div>
                    
                    <div className="mt-4">
                        <InputLabel value="Fitur" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 p-4 border rounded-md">
                            {featuresList.map(feature => (
                                <label key={feature} className="flex items-center">
                                    <input type="checkbox" checked={data.features.includes(feature)} onChange={() => handleFeatureChange(feature)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                                    <span className="ml-2 text-sm text-gray-600">{feature}</span>
                                </label>
                            ))}
                        </div>
                         <InputError message={errors.features} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="image_files" value="Gambar Mobil (Bisa lebih dari satu)" isRequired />
                        <input type="file" multiple onChange={e => setData('image_files', e.target.files)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        {progress && (
                            <div className="w-full bg-gray-200 rounded-full mt-2">
                                <div className="bg-indigo-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress.percentage}%` }}>{progress.percentage}%</div>
                            </div>
                        )}
                        <InputError message={errors.image_files} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <Link href={route('admin.cars.index')} className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-300">
                            Batal
                        </Link>
                        <PrimaryButton disabled={processing}>Simpan Mobil</PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
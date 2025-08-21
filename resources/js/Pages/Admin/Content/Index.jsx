import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import { format, parseISO } from 'date-fns';

// Komponen Reusable: Toggle Switch
const Toggle = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        onClick={() => onChange(!enabled)}
    >
        <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
);

// --- Panel Manajemen Kode Promo ---
const PromotionsPanel = ({ initialPromotions }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id: null,
        code: '',
        type: 'fixed',
        value: '',
        valid_from: '',
        valid_to: '',
        is_active: true,
    });

    const openModal = (promo = null) => {
        reset();
        if (promo) {
            setIsEditing(true);
            setData({
                id: promo.id,
                code: promo.code,
                type: promo.type,
                value: promo.value,
                valid_from: promo.valid_from ? format(parseISO(promo.valid_from), 'yyyy-MM-dd') : '',
                valid_to: promo.valid_to ? format(parseISO(promo.valid_to), 'yyyy-MM-dd') : '',
                is_active: promo.is_active,
            });
        } else {
            setIsEditing(false);
            setData('is_active', true);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const submit = (e) => {
        e.preventDefault();
        const options = { onSuccess: closeModal, preserveScroll: true };
        if (isEditing) {
            put(route('admin.content.promotions.update', data.id), options);
        } else {
            post(route('admin.content.promotions.store'), options);
        }
    };

    const deletePromo = (promo) => {
        Swal.fire({
            title: 'Hapus Kode Promo?',
            text: `Anda yakin ingin menghapus kode "${promo.code}"? Aksi ini tidak dapat dibatalkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then(result => {
            if (result.isConfirmed) {
                destroy(route('admin.content.promotions.destroy', promo.id), { preserveScroll: true });
            }
        });
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <PrimaryButton onClick={() => openModal()}>Tambah Kode Promo</PrimaryButton>
            </div>
            <div className="p-6 bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berlaku Dari</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berlaku Sampai</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {initialPromotions.map(promo => (
                            <tr key={promo.id}>
                                <td className="px-6 py-4 font-mono font-bold text-indigo-600">{promo.code}</td>
                                <td className="px-6 py-4 capitalize">{promo.type}</td>
                                <td className="px-6 py-4">{promo.type === 'fixed' ? `Rp ${new Intl.NumberFormat('id-ID').format(promo.value)}` : `${promo.value}%`}</td>
                                <td className="px-6 py-4 text-sm">{promo.valid_from ? format(parseISO(promo.valid_from), 'dd MMM yyyy') : '-'}</td>
                                <td className="px-6 py-4 text-sm">{promo.valid_to ? format(parseISO(promo.valid_to), 'dd MMM yyyy') : '-'}</td>
                                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{promo.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <button onClick={() => openModal(promo)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button onClick={() => deletePromo(promo)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">{isEditing ? 'Edit Kode Promo' : 'Buat Kode Promo Baru'}</h2>
                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="code" value="Kode Unik" />
                            <TextInput id="code" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} className="w-full mt-1" />
                            <InputError message={errors.code} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="type" value="Tipe Diskon" />
                                <select id="type" value={data.type} onChange={e => setData('type', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                                    <option value="fixed">Nominal (Rp)</option>
                                    <option value="percentage">Persentase (%)</option>
                                </select>
                            </div>
                             <div>
                                <InputLabel htmlFor="value" value="Nilai" />
                                <TextInput type="number" id="value" value={data.value} onChange={e => setData('value', e.target.value)} className="w-full mt-1" />
                                <InputError message={errors.value} className="mt-2" />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="valid_from" value="Berlaku Dari (Opsional)" />
                                <TextInput type="date" id="valid_from" value={data.valid_from} onChange={e => setData('valid_from', e.target.value)} className="w-full mt-1" />
                            </div>
                             <div>
                                <InputLabel htmlFor="valid_to" value="Berlaku Sampai (Opsional)" />
                                <TextInput type="date" id="valid_to" value={data.valid_to} onChange={e => setData('valid_to', e.target.value)} className="w-full mt-1" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <InputLabel htmlFor="is_active" value="Aktifkan Promo" />
                            <Toggle enabled={data.is_active} onChange={value => setData('is_active', value)} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// --- Panel Manajemen Banner ---
const BannersPanel = ({ initialBanners }) => {
    const { data, setData, post, processing, errors, reset, progress } = useForm({
        title: '',
        target_url: '',
        image: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.content.banners.store'), {
            forceFormData: true,
            onSuccess: () => reset('title', 'target_url', 'image'),
        });
    };
    
    const togglePublish = (banner) => {
        router.put(route('admin.content.banners.updateStatus', banner.id), {
            is_published: !banner.is_published,
        }, { preserveScroll: true });
    };

    const deleteBanner = (banner) => {
        Swal.fire({
            title: 'Hapus Banner?',
            text: `Anda yakin ingin menghapus banner "${banner.title}"?`,
            icon: 'warning',
            showCancelButton: true,
        }).then(result => {
            if (result.isConfirmed) {
                router.delete(route('admin.content.banners.destroy', banner.id), { preserveScroll: true });
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium">Unggah Banner Baru</h3>
                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="title" value="Judul Banner" />
                            <TextInput id="title" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full mt-1" />
                            <InputError message={errors.title} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="target_url" value="URL Tujuan (Opsional)" />
                            <TextInput id="target_url" value={data.target_url} onChange={e => setData('target_url', e.target.value)} className="w-full mt-1" placeholder="https://..." />
                            <InputError message={errors.target_url} className="mt-2" />
                        </div>
                        <div>
                             <InputLabel htmlFor="image" value="File Gambar" />
                             <input type="file" onChange={e => setData('image', e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                             {progress && <progress value={progress.percentage} max="100" className="w-full mt-2" />}
                             <InputError message={errors.image} className="mt-2" />
                        </div>
                        <PrimaryButton disabled={processing}>Unggah Banner</PrimaryButton>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="p-6 bg-white rounded-lg shadow">
                     <h3 className="text-lg font-medium">Daftar Banner</h3>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {initialBanners.map(banner => (
                            <div key={banner.id} className="border rounded-lg overflow-hidden shadow-sm">
                                <img src={`/storage/${banner.image_path}`} alt={banner.title} className="h-40 w-full object-cover" />
                                <div className="p-4">
                                    <h4 className="font-semibold truncate">{banner.title}</h4>
                                    <a href={banner.target_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline truncate block">{banner.target_url}</a>
                                    <div className="mt-4 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Toggle enabled={banner.is_published} onChange={() => togglePublish(banner)} />
                                            <span className="text-sm">{banner.is_published ? 'Published' : 'Draft'}</span>
                                        </div>
                                        <DangerButton onClick={() => deleteBanner(banner)}>Hapus</DangerButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};


// --- Komponen Utama ---
export default function Index({ auth, promotions, banners }) {
    const [activeTab, setActiveTab] = useState('promos');

    return (
        <AdminLayout user={auth.user} header="Konten & Pemasaran">
            <Head title="Konten & Pemasaran" />

            <div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('promos')} className={`${activeTab === 'promos' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Kode Promo
                        </button>
                        <button onClick={() => setActiveTab('banners')} className={`${activeTab === 'banners' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Manajemen Banner
                        </button>
                    </nav>
                </div>

                <div className="mt-6">
                    {activeTab === 'promos' && <PromotionsPanel initialPromotions={promotions} />}
                    {activeTab === 'banners' && <BannersPanel initialBanners={banners} />}
                </div>
            </div>
        </AdminLayout>
    );
}
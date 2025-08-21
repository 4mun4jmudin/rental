import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout'; // Impor layout utama
import { Head, Link, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Swal from 'sweetalert2';

// Komponen kecil untuk Paginasi
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

export default function UserIndex({ auth, users }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        full_name: '',
        email: '',
        phone_number: '',
        address: '',
        role: 'penyewa',
        password: '',
        password_confirmation: '',
    });

    const openAddModal = () => {
        reset();
        clearErrors();
        setIsEditing(false);
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        reset();
        clearErrors();
        setData({
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number || '',
            address: user.address || '',
            role: user.role,
            password: '',
            password_confirmation: '',
        });
        setIsEditing(true);
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => closeModal(),
            onError: () => {}, // Biarkan pesan error otomatis ditampilkan
        };

        if (isEditing) {
            put(route('admin.users.update', currentUser.id), options);
        } else {
            post(route('admin.users.store'), options);
        }
    };
    
    const handleDelete = (user) => {
        Swal.fire({
            title: 'Apakah Anda Yakin?',
            text: `Anda akan menghapus pengguna "${user.full_name}". Tindakan ini tidak dapat dibatalkan!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.users.destroy', user.id));
            }
        });
    };

    return (
        <AdminLayout user={auth.user} header="Manajemen Pengguna">
            <Head title="Manajemen Pengguna" />

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <PrimaryButton onClick={openAddModal} className="mb-4">
                        Tambah Pengguna
                    </PrimaryButton>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                user.role === 'pemilik_rental' ? 'bg-yellow-100 text-yellow-800' :
                                                user.role === 'kasir' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <DangerButton onClick={() => handleDelete(user)} disabled={auth.user.id === user.id}>
                                                Hapus
                                            </DangerButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination links={users.links} />

                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEditing ? `Edit Pengguna: ${currentUser.full_name}` : 'Tambah Pengguna Baru'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="full_name" value="Nama Lengkap" />
                        <TextInput id="full_name" name="full_name" value={data.full_name} onChange={(e) => setData('full_name', e.target.value)} className="mt-1 block w-full" required />
                        <InputError message={errors.full_name} className="mt-2" />
                    </div>
                    
                    <div className="mt-4">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput id="email" type="email" name="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 block w-full" required />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="role" value="Peran" />
                        <select id="role" name="role" value={data.role} onChange={(e) => setData('role', e.target.value)} className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                            <option value="penyewa">Penyewa</option>
                            <option value="kasir">Kasir</option>
                            <option value="pemilik_rental">Pemilik Rental</option>
                            <option value="admin">Admin</option>
                        </select>
                        <InputError message={errors.role} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput id="password" type="password" name="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.password} className="mt-2" />
                        {isEditing && <p className="text-sm text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah password.</p>}
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                        <TextInput id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal} type="button">Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
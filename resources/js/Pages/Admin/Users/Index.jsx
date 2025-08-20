import React, { useState, useEffect } from 'react';
import AdminDashboard from '@/Pages/AdminDashboard';
import { Head, Link, router } from '@inertiajs/react';
import { PencilIcon, TrashIcon, EyeIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

// Komponen untuk Paginasi
const Pagination = ({ links }) => {
    return (
        <div className="mt-6 flex items-center justify-between">
            <div className="flex flex-1 justify-between sm:justify-end">
                {links.map((link, key) => (
                    link.url === null ?
                        (<div key={key}
                              className="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded"
                              dangerouslySetInnerHTML={{ __html: link.label }} />) :
                        (<Link key={key}
                               className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded hover:bg-white focus:border-indigo-500 focus:text-indigo-500 ${link.active ? 'bg-white' : ''}`}
                               href={link.url}
                               dangerouslySetInnerHTML={{ __html: link.label }} />)
                ))}
            </div>
        </div>
    );
};

export default function UserIndex({ auth, users, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    // Fungsi ini akan dijalankan saat pengguna mengetik di kolom pencarian
    useEffect(() => {
        // Debounce: tunggu 300ms setelah user berhenti mengetik baru kirim request
        const timeoutId = setTimeout(() => {
            router.get(route('users.index'), { search: search }, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);
    
    return (
        <AdminDashboard user={auth.user} title="Manajemen Pengguna">
            <Head title="Pengguna" />

            <div className="mb-6 flex items-center justify-between">
                <input
                    type="text"
                    name="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari berdasarkan nama atau email..."
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <Link
                    href={route('users.create')} // Rute ini akan kita buat nanti
                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition"
                >
                    Tambah Pengguna
                </Link>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full whitespace-no-wrap">
                    <thead className="bg-gray-50">
                        <tr className="text-left font-bold">
                            <th className="px-6 py-3">Nama</th>
                            <th className="px-6 py-3">Email & Telepon</th>
                            <th className="px-6 py-3">Tgl. Registrasi</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-100 focus-within:bg-gray-100">
                                <td className="border-t px-6 py-4">{user.full_name}</td>
                                <td className="border-t px-6 py-4">
                                    <div className="font-medium">{user.email}</div>
                                    <div className="text-sm text-gray-500">{user.phone_number}</div>
                                </td>
                                <td className="border-t px-6 py-4">
                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                </td>
                                <td className="border-t px-6 py-4">
                                    {/* Logika status (bisa disesuaikan) */}
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Aktif
                                    </span>
                                </td>
                                <td className="border-t px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-gray-500 hover:text-blue-600">
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:text-yellow-600">
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:text-red-600">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:text-gray-800">
                                            <LockOpenIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.data.length === 0 && (
                            <tr>
                                <td className="border-t px-6 py-4" colSpan="5">
                                    Tidak ada data pengguna ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <Pagination links={users.links} />

        </AdminDashboard>
    );
}
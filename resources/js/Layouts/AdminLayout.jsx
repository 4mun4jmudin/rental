import React, { useState } from 'react';
import Sidebar from '@/Components/Sidebar'; // Pastikan path ini benar
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Head } from '@inertiajs/react';

export default function AdminLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <Head title={header} />
            {/* 1. Tambahkan `flex` pada div pembungkus utama */}
            <div className="flex min-h-screen bg-gray-100">
                
                {/* Sidebar tidak perlu diubah, akan menjadi anak pertama dari flex container */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* 2. Hapus `md:pl-64` dan atur div ini sebagai anak kedua dari flex container */}
                <div className="flex flex-col flex-1 md:pl-64">
                    
                    {/* Header Atas */}
                    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
                        <button
                            type="button"
                            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Buka sidebar</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>
                        <div className="flex flex-1 items-center justify-between px-4">
                             <h1 className="text-lg font-semibold text-gray-800">{header}</h1>
                             <div>{user.full_name}</div>
                        </div>
                    </div>

                    {/* Konten Utama */}
                    <main className="flex-1">
                        <div className="py-6">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
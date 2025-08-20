import { Link, usePage } from '@inertiajs/react';
import { Transition, Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import {
    HomeIcon,
    UsersIcon,
    TruckIcon,
    ClipboardDocumentListIcon,
    BanknotesIcon,
    ShieldCheckIcon,
    MegaphoneIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Komponen internal untuk membuat tautan navigasi.
 * Ini membantu menjaga kode tetap bersih dan mudah dibaca.
 * @param {object} props - Properti komponen.
 * @param {string} props.href - URL tujuan tautan.
 * @param {React.ReactNode} props.children - Konten di dalam tautan (ikon dan teks).
 * @param {boolean} props.active - Menandakan apakah tautan sedang aktif.
 */
function NavLink({ href, children, active }) {
    const activeClasses = 'bg-gray-900 text-white';
    const inactiveClasses = 'text-gray-400 hover:bg-gray-700 hover:text-white';

    return (
        <Link
            href={href}
            className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                active ? activeClasses : inactiveClasses
            }`}
        >
            {children}
        </Link>
    );
}

/**
 * Komponen Sidebar Utama
 * @param {object} props - Properti komponen.
 * @param {boolean} props.isOpen - Status apakah sidebar terbuka (untuk mobile).
 * @param {Function} props.onClose - Fungsi untuk menutup sidebar (untuk mobile).
 */
export default function Sidebar({ isOpen, onClose }) {
    const { url } = usePage();

    // Daftar menu navigasi. Ganti '#' dengan rute yang sesuai dari Laravel (contoh: route('users.index'))
    const navigation = [
        { name: 'Halaman Utama', href: route('dashboard'), icon: HomeIcon, current: route().current('dashboard') },
        { name: 'Manajemen Pengguna', href: route('users.index'), icon: UsersIcon, current: route().current('users.*') },
        { name: 'Manajemen Armada', href: '#', icon: TruckIcon, current: url.startsWith('/fleet') },
        { name: 'Manajemen Pesanan', href: '#', icon: ClipboardDocumentListIcon, current: url.startsWith('/bookings') },
        { name: 'Manajemen Keuangan', href: '#', icon: BanknotesIcon, current: url.startsWith('/finance') },
        { name: 'Moderasi & Verifikasi', href: '#', icon: ShieldCheckIcon, current: url.startsWith('/moderation') },
        { name: 'Konten & Pemasaran', href: '#', icon: MegaphoneIcon, current: url.startsWith('/content') },
        { name: 'Laporan & Analitik', href: '#', icon: ChartBarIcon, current: url.startsWith('/reports') },
        { name: 'Pengaturan Sistem', href: '#', icon: Cog6ToothIcon, current: url.startsWith('/settings') },
    ];

    // Konten JSX untuk sidebar agar tidak perlu ditulis dua kali
    const sidebarContent = (
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
            <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
                <div className="flex flex-shrink-0 items-center px-4">
                    <h1 className="text-2xl font-bold text-white">Rental Admin</h1>
                </div>
                <nav className="mt-5 flex-1 space-y-1 px-2" aria-label="Sidebar">
                    {navigation.map((item) => (
                        <NavLink key={item.name} href={item.href} active={item.current}>
                            <item.icon
                                className="mr-3 h-6 w-6 flex-shrink-0"
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );

    return (
        <>
            {/* --- Sidebar untuk Tampilan Desktop --- */}
            {/* Selalu terlihat di layar medium ke atas (md:) */}
            <div className="hidden md:flex md:w-64 md:flex-shrink-0">{sidebarContent}</div>

            {/* --- Sidebar untuk Tampilan Mobile --- */}
            {/* Menggunakan Transisi dan Dialog dari Headless UI untuk animasi dan aksesibilitas */}
            <Transition show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-40 md:hidden" onClose={onClose}>
                    {/* Latar belakang overlay gelap */}
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                    </Transition.Child>

                    {/* Konten sidebar yang bisa slide in/out */}
                    <div className="fixed inset-0 z-40 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col">
                                {/* Tombol close di dalam sidebar mobile */}
                                <div className="absolute right-0 top-0 -mr-12 pt-2">
                                    <button
                                        type="button"
                                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Tutup sidebar</span>
                                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </button>
                                </div>
                                {sidebarContent}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
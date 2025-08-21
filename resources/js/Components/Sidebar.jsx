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

// Komponen internal untuk tautan navigasi
function NavLink({ href, children, active }) {
    const activeClasses = 'bg-gray-900 text-white';
    const inactiveClasses = 'text-gray-400 hover:bg-gray-700 hover:text-white';

    return (
        <Link
            href={href}
            className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${active ? activeClasses : inactiveClasses
                }`}
        >
            {children}
        </Link>
    );
}

// Komponen utama Sidebar
export default function Sidebar({ isOpen, onClose }) {
    const { props: { auth } } = usePage();

    // Daftar menu navigasi dengan kondisi 'current' yang dinamis
    const navigation = [
        { name: 'Halaman Utama', href: route('dashboard'), icon: HomeIcon, current: route().current('dashboard'), roles: ['admin', 'kasir', 'pemilik_rental', 'penyewa'] },
        { name: 'Manajemen Pengguna', href: route('admin.users.index'), icon: UsersIcon, current: route().current('admin.users.index'), roles: ['admin'] },
        { name: 'Manajemen Armada', href: route('admin.cars.index'), icon: TruckIcon, current: route().current('admin.cars.*'), roles: ['admin', 'pemilik_rental'] },
        { name: 'Manajemen Pesanan', href: route('admin.bookings.index'), icon: ClipboardDocumentListIcon, current: route().current('admin.bookings.*'), roles: ['admin', 'kasir'] },
        { name: 'Manajemen Keuangan', href: route('admin.payments.index'), icon: BanknotesIcon, current: route().current('admin.payments.*'), roles: ['admin', 'pemilik_rental'] },
        { name: 'Moderasi & Verifikasi', href: route('admin.verifications.index'), icon: ShieldCheckIcon, current: route().current('admin.verifications.*'), roles: ['admin'] },
        { name: 'Konten & Pemasaran', href: route('admin.content.index'), icon: MegaphoneIcon, current: route().current('admin.content.*'), roles: ['admin'] },
        { name: 'Laporan & Analitik', href: route('admin.reports.index'), icon: ChartBarIcon, current: route().current('admin.reports.*'), roles: ['admin', 'pemilik_rental'] },
        { name: 'Pengaturan Sistem', href: '#', icon: Cog6ToothIcon, current: false, roles: ['admin'] },
    ];

    // Konten JSX untuk sidebar agar tidak diulang
    const sidebarContent = (
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
            <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
                <div className="flex flex-shrink-0 items-center px-4">
                    <h1 className="text-2xl font-bold text-white">Rental Admin</h1>
                </div>
                <nav className="mt-5 flex-1 space-y-1 px-2" aria-label="Sidebar">
                    {navigation
                        .filter(item => item.roles.includes(auth.user.role))
                        .map((item) => (
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
            {/* Sidebar untuk Desktop (Fixed Position) */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                {sidebarContent}
            </div>

            {/* Sidebar untuk Mobile (Overlay) */}
            <Transition show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-40 md:hidden" onClose={onClose}>
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
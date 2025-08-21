import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton'; // Import yang sebelumnya hilang
import Modal from '@/Components/Modal';
import Textarea from '@/Components/Textarea';
import Swal from 'sweetalert2';

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

// Komponen Utama
export default function Index({ auth, pendingDocuments }) {
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);

    const handleAction = (document, status) => {
        if (status === 'rejected') {
            setSelectedDocument(document);
            setRejectionReason(''); // Kosongkan alasan setiap kali modal dibuka
            setShowRejectionModal(true);
        } else { // Approved
            Swal.fire({
                title: 'Konfirmasi Persetujuan',
                text: `Anda yakin ingin menyetujui dokumen ${document.type} untuk ${document.user.full_name}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Ya, Setujui!',
                cancelButtonText: 'Batal',
            }).then((result) => {
                if (result.isConfirmed) {
                    router.put(route('admin.verifications.document.update', document.id), { status: 'approved' }, {
                        preserveScroll: true,
                        onSuccess: () => Swal.fire('Berhasil!', 'Dokumen telah disetujui.', 'success')
                    });
                }
            });
        }
    };

    const submitRejection = (e) => {
        e.preventDefault();
        router.put(route('admin.verifications.document.update', selectedDocument.id), {
            status: 'rejected',
            rejection_reason: rejectionReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectionModal(false);
                Swal.fire('Berhasil!', 'Dokumen telah ditolak.', 'success');
            },
            onError: (errors) => {
                // Biarkan error ditampilkan di modal jika ada
            }
        });
    };

    return (
        <AdminLayout user={auth.user} header="Moderasi & Verifikasi">
            <Head title="Moderasi & Verifikasi" />

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <h2 className="text-xl font-semibold mb-4">Verifikasi Dokumen Tertunda</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe Dokumen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Diajukan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokumen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingDocuments.data.length > 0 ? pendingDocuments.data.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{doc.user.full_name}</div>
                                            <div className="text-sm text-gray-500">{doc.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold">{doc.type}</td>
                                        <td className="px-6 py-4 text-sm">{new Date(doc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                        <td className="px-6 py-4">
                                            <a href={`/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
                                                Lihat Dokumen
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <PrimaryButton onClick={() => handleAction(doc, 'approved')}>Setujui</PrimaryButton>
                                                <DangerButton onClick={() => handleAction(doc, 'rejected')}>Tolak</DangerButton>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada dokumen yang menunggu verifikasi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                     <Pagination links={pendingDocuments.links} />
                </div>
            </div>

            {/* Modal untuk Alasan Penolakan */}
            <Modal show={showRejectionModal} onClose={() => setShowRejectionModal(false)}>
                <form onSubmit={submitRejection} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Alasan Penolakan</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Mohon berikan alasan mengapa dokumen ini ditolak. Alasan ini akan dapat dilihat oleh pengguna.
                    </p>
                    <div className="mt-4">
                        <Textarea
                            className="w-full min-h-[100px]"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            required
                            placeholder="Contoh: Foto KTP tidak jelas atau buram."
                        />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={() => setShowRejectionModal(false)}>Batal</SecondaryButton>
                        <DangerButton className="ml-3">Kirim Penolakan</DangerButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteRoom } from '../services/roomService';

const RoomTable = ({ rooms, onEdit }) => {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalRooms = rooms.length;
    const totalPages = Math.ceil(totalRooms / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRooms = rooms.slice(startIndex, startIndex + itemsPerPage);

    const handleWhatsAppRedirect = (staff) => {
        if (!staff || !staff.phone) {
            alert('Nomor telepon tidak ditemukan untuk staf ini.');
            return;
        }

        // Ensure phone starts with 62
        let phone = staff.phone.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }

        const message = encodeURIComponent(`Halo ${staff.name},\nAda tugas untuk kamar pengelolaan.\nSilakan segera ditindaklanjuti.\n\nTerima kasih.`);
        const url = `https://wa.me/${phone}?text=${message}`;
        window.open(url, '_blank');
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl transition-colors duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-surface-darker border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                            <th className="py-4 px-6 text-[10px] font-extrabold text-primary uppercase tracking-widest w-[120px]">{t('common.room')} No.</th>
                            <th className="py-4 px-6 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Type</th>
                            <th className="py-4 px-6 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('common.floor')}</th>
                            <th className="py-4 px-6 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('common.status')}</th>
                            <th className="py-4 px-6 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Last Staff</th>
                            <th className="py-4 px-6 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">{t('common.action')}</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50 dark:divide-gray-800">
                        {paginatedRooms.map((room) => (
                            <tr key={room.id} className={`group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${room.isVip ? 'bg-primary/5 dark:bg-primary/5' : ''}`}>
                                <td className="py-4 px-6 relative">
                                    {room.isVip && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                                    <span className="text-xl font-display font-bold text-gray-900 dark:text-white">{room.number}</span>
                                    {room.isVip && (
                                        <span className="material-symbols-outlined text-primary text-[14px] absolute top-2 right-4" title="VIP Guest">star</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-gray-900 dark:text-white font-bold">
                                    {room.type || 'Standard'}
                                </td>
                                <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-medium">{room.floor || '1st Floor'}</td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${room.status === 'available' ? 'bg-status-ready/10 text-status-ready border-status-ready/20' :
                                        room.status === 'occupied' ? 'bg-primary/10 text-primary border-primary/20' :
                                            room.status === 'dirty' ? 'bg-status-dirty/10 text-status-dirty border-status-dirty/20' :
                                                room.status === 'cleaning' ? 'bg-status-cleaning/10 text-status-cleaning border-status-cleaning/20' :
                                                    'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                                        }`}>
                                        {room.status === 'cleaning' && <span className="w-1.5 h-1.5 rounded-full bg-status-cleaning animate-ping"></span>}
                                        {room.status === 'available' && <span className="w-1.5 h-1.5 rounded-full bg-status-ready animate-pulse"></span>}
                                        {room.status === 'occupied' && <span className="material-symbols-outlined text-[14px]">person</span>}
                                        {room.status === 'dirty' && <span className="material-symbols-outlined text-[14px]">cleaning_services</span>}
                                        {room.status === 'maintenance' && <span className="material-symbols-outlined text-[14px]">build</span>}
                                        {t(`common.${room.status}`, { defaultValue: room.status })}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    {room.staff ? (
                                        <div
                                            className="flex items-center gap-3 cursor-pointer group/staff"
                                            onClick={() => handleWhatsAppRedirect(room.staff)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-600 shadow-sm relative overflow-hidden bg-[#242424] dark:bg-[#1a1a1a] flex items-center justify-center">
                                                {room.staff.avatar && !room.staff.avatar.includes('pravatar.cc') ? (
                                                    <img src={room.staff.avatar} alt={room.staff.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-primary font-display font-black text-xs drop-shadow-[0_0_5px_rgba(244,192,37,0.3)]">{room.staff.name?.charAt(0)}</span>
                                                )}
                                                <div className="absolute inset-0 bg-emerald-500/80 opacity-0 group-hover/staff:opacity-100 transition-all flex items-center justify-center">
                                                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.006.332.009c.109.004.258-.045.405.314.144.354.491 1.196.534 1.282.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.101-.177.211-.077.382.101.171.445.733.954 1.187.654.582 1.203.763 1.376.849s.275.058.376-.058c.101-.116.434-.506.549-.68.116-.173.231-.144.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 dark:text-white text-xs font-bold group-hover/staff:text-emerald-500 transition-colors">{room.staff.name}</span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase">{t('common.staff')}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 italic font-extrabold uppercase tracking-widest">-- {t('dashboard.pending')} --</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button
                                        onClick={() => onEdit(room)}
                                        className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit_square</span>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(t('common.confirm_delete', { defaultValue: 'Are you sure you want to delete this?' }))) {
                                                await deleteRoom(room.id);
                                            }
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-1"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-surface-darker transition-colors duration-300">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest">
                    Showing <span className="text-gray-900 dark:text-white font-black">{totalRooms > 0 ? startIndex + 1 : 0}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, totalRooms)}</span> of <span className="text-gray-900 dark:text-white font-black">{totalRooms}</span> entries
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black bg-primary rounded shadow-md hover:bg-primary-dark transition-colors">
                        {currentPage}
                    </button>
                    <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors shadow-none uppercase tracking-widest disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomTable;

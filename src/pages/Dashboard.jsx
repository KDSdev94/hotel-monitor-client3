import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import FilterBar from '../components/FilterBar';
import RoomCard from '../components/RoomCard';
import { subscribeToRooms } from '../services/roomService';
import { subscribeToStaff } from '../services/staffService';
import RoomModal from '../components/RoomModal';
import AssignStaffModal from '../components/AssignStaffModal';
import { subscribeToRoomTypes } from '../services/roomTypeService';

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('Floor Number');
    const [rooms, setRooms] = useState([]);
    const [staff, setStaff] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeRooms = subscribeToRooms((data) => {
            setRooms(data);
            setLoading(false);
        });
        const unsubscribeStaff = subscribeToStaff((data) => setStaff(data));
        const unsubscribeRoomTypes = subscribeToRoomTypes((data) => setRoomTypes(data));

        return () => {
            unsubscribeRooms();
            unsubscribeStaff();
            unsubscribeRoomTypes();

        };
    }, []);

    const dynamicStats = [
        { title: 'Semua Kamar', value: rooms.length, icon: 'bed', color: 'text-primary' },
        { title: 'Tersedia', value: rooms.filter(r => r.status === 'available').length, icon: 'check_circle', color: 'text-status-ready', trend: '+5%', down: false },
        { title: 'Kotor', value: rooms.filter(r => r.status === 'dirty').length, icon: 'cleaning_services', color: 'text-status-dirty', trend: '+12%', down: false },
        { title: 'Pembersihan', value: rooms.filter(r => r.status === 'cleaning').length, icon: 'cleaning_services', color: 'text-status-cleaning', trend: '-2%', down: true },
        { title: 'Perbaikan', value: rooms.filter(r => r.status === 'maintenance').length, icon: 'handyman', color: 'text-gray-500', trend: '0%', down: false },
    ];

    const filters = [
        { id: 'all', label: 'Semua Kamar', count: rooms.length },
        { id: 'available', label: 'Tersedia', count: rooms.filter(r => r.status === 'available').length, color: 'bg-status-ready' },
        { id: 'dirty', label: 'Kotor', count: rooms.filter(r => r.status === 'dirty').length, color: 'bg-status-dirty' },
        { id: 'cleaning', label: 'Pembersihan', count: rooms.filter(r => r.status === 'cleaning').length, color: 'bg-status-cleaning' },
        { id: 'maintenance', label: 'Perbaikan', count: rooms.filter(r => r.status === 'maintenance').length, color: 'bg-gray-500' },
    ];

    const sortOptions = [
        t('common.floor'),
        t('common.status')
    ];

    const [viewMode, setViewMode] = useState('grid');

    const filteredRooms = useMemo(() => {
        let result = filter === 'all' ? rooms : rooms.filter(room => room.status === filter);

        // Handle sorting
        if (sortBy === 'Floor' || sortBy === 'Lantai') {
            result = [...result].sort((a, b) => (a.number || '').localeCompare(b.number || ''));
        } else if (sortBy === 'Status') {
            result = [...result].sort((a, b) => (a.status || '').localeCompare(b.status || ''));
        }

        return result;
    }, [rooms, filter, sortBy]);

    const handleWhatsAppRedirect = (staffMember) => {
        if (!staffMember?.phone) return;

        // Ensure phone starts with 62
        let phone = staffMember.phone.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }

        const message = encodeURIComponent(`Halo ${staffMember.name},\nAda tugas untuk pengelolaan kamar.\nSilakan segera ditindaklanjuti.\n\nTerima kasih.`);
        const url = `https://wa.me/${phone}?text=${message}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Realtime Data...</p>
            </div>
        );
    }

    return (
        <div className="transition-colors duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
                <div className="w-full lg:w-auto">
                    <p className="text-primary font-display italic text-lg mb-1">{t('common.welcome')}</p>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('common.realtime_overview')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {new Date().toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })} • {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full lg:flex-1 lg:max-w-4xl justify-end">
                    {dynamicStats.map((stat, idx) => (
                        <StatsCard
                            key={idx}
                            {...stat}
                            title={stat.title}
                            subtitle={stat.subtitle}
                        />
                    ))}
                </div>
            </div>

            <FilterBar
                currentFilter={filter}
                onFilterChange={setFilter}
                filters={filters}
                onSortChange={setSortBy}
                sortOptions={sortOptions}
                viewMode={viewMode}
                onViewChange={setViewMode}
            />

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredRooms.slice(0, 10).map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            onClick={(r) => {
                                setSelectedRoom(r);
                                setIsAssignModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-surface-darker/50 border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary uppercase tracking-widest">Kamar</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Tipe</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Lantai</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Staf</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {filteredRooms.slice(0, 10).map((room) => (
                                    <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-xl font-display font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{room.number}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{room.type}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{room.floor}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${room.status === 'available' ? 'bg-status-ready/10 text-status-ready border-status-ready/20' :
                                                    room.status === 'occupied' ? 'bg-primary/10 text-primary border-primary/20' :
                                                        room.status === 'dirty' ? 'bg-status-dirty/10 text-status-dirty border-status-dirty/20' :
                                                            'bg-status-cleaning/10 text-status-cleaning border-status-cleaning/20'
                                                }`}>
                                                {room.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {room.staff ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                                        {room.staff.name?.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{room.staff.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 font-bold italic">Belum Ada</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => { setSelectedRoom(room); setIsAssignModalOpen(true); }}
                                                className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 p-6 shadow-xl transition-colors duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{t('dashboard.active_housekeeping')}</h3>
                        <button
                            onClick={() => navigate('/manage-staff')}
                            className="text-primary text-sm hover:underline font-bold"
                        >
                            {t('dashboard.view_all_staff')}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th className="pb-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-2">{t('dashboard.staff_member')}</th>
                                    <th className="pb-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('dashboard.current_room')}</th>
                                    <th className="pb-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('dashboard.floor')}</th>
                                    <th className="pb-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('dashboard.status')}</th>
                                    <th className="pb-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right pr-2">{t('dashboard.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {staff.map((staffMember) => {
                                    // Calculate assigned rooms for this staff member
                                    const assignedRooms = rooms.filter(r => r.staff?.id === staffMember.id);
                                    const roomNumbers = assignedRooms.map(r => r.number).join(', ') || '-';
                                    const floors = [...new Set(assignedRooms.map(r => r.floor))].join(', ') || '-';

                                    return (
                                        <tr key={staffMember.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="py-4 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#242424] dark:bg-[#1a1a1a] flex items-center justify-center ring-2 ring-primary/10 transition-transform group-hover:scale-110">
                                                        {staffMember.avatar && !staffMember.avatar.includes('pravatar.cc') ? (
                                                            <img src={staffMember.avatar} alt={staffMember.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-primary font-display font-black text-xs drop-shadow-[0_0_5px_rgba(244,192,37,0.3)]">
                                                                {staffMember.name?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-900 dark:text-white font-bold">{staffMember.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-primary font-display font-bold">{roomNumbers}</td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400 font-medium">{floors}</td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${staffMember.status === 'On Duty' || staffMember.status === 'Cleaning' || staffMember.status === 'Sedang Bertugas'
                                                    ? 'bg-status-cleaning/10 text-status-cleaning'
                                                    : 'bg-status-ready/10 text-status-ready'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${staffMember.status === 'On Duty' || staffMember.status === 'Cleaning' || staffMember.status === 'Sedang Bertugas'
                                                        ? 'bg-status-cleaning'
                                                        : 'bg-status-ready'
                                                        }`}></span>
                                                    {t(`common.${(staffMember.status || 'Offline').toLowerCase().replace(' ', '_')}`)}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right pr-2">
                                                <button
                                                    onClick={() => handleWhatsAppRedirect(staffMember)}
                                                    className="text-emerald-500 hover:text-emerald-600 transition-all transform hover:scale-110 active:scale-95"
                                                    title="Contact via WhatsApp"
                                                >
                                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.006.332.009c.109.004.258-.045.405.314.144.354.491 1.196.534 1.282.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.101-.177.211-.077.382.101.171.445.733.954 1.187.654.582 1.203.763 1.376.849s.275.058.376-.058c.101-.116.434-.506.549-.68.116-.173.231-.144.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zM12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl p-6 relative overflow-hidden group shadow-xl flex flex-col justify-between transition-all hover:scale-[1.01] duration-300">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500"></div>
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold font-display uppercase tracking-widest text-gray-900 dark:text-white">{t('dashboard.quick_operations')}</h3>
                            <span className="material-symbols-outlined bg-primary/10 text-primary p-2 rounded-full font-bold">handyman</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed italic">{t('dashboard.all_systems_ready')}</p>

                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => navigate('/reports')}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all group/btn"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">assessment</span>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{t('reports.performance_reports')}</span>
                                </div>
                                <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover/btn:translate-x-1 transition-transform">chevron_right</span>
                            </button>

                            <button
                                onClick={() => navigate('/manage-staff')}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all group/btn"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">groups</span>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{t('dashboard.view_all_staff')}</span>
                                </div>
                                <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover/btn:translate-x-1 transition-transform">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                            <span>{t('dashboard.total_efficiency')}</span>
                            <span className="text-primary">98.2%</span>
                        </div>
                    </div>
                </div>


            </div>
            <AssignStaffModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                room={selectedRoom}
                staffList={staff}
            />
            <RoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                room={selectedRoom}
                roomTypes={roomTypes}
                staffList={staff}
            />
        </div>
    );
};

export default Dashboard;

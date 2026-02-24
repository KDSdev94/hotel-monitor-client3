import { useState, useEffect } from 'react';
import { subscribeToRooms, updateRoomStatus } from '../../services/roomService';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import RoomCard from '../../components/RoomCard';

const StaffRooms = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToRooms((data) => {
            // Filter rooms assigned to this user (based on staff.uid or assignedStaffId)
            const assignedRooms = data.filter(room =>
                room.assignedStaffId === user?.uid ||
                room.staff?.uid === user?.uid ||
                room.staff?.id === user?.uid // Checking various possible ID mappings
            );
            setRooms(assignedRooms);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const filteredRooms = rooms.filter(room => {
        const matchSearch = room.number?.toLowerCase().includes(search.toLowerCase()) ||
            room.type?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || room.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleRoomClick = (room) => {
        setSelectedRoom(room);
    };

    const handleQuickStatusUpdate = async (roomId, newStatus) => {
        try {
            await updateRoomStatus(roomId, newStatus, user.displayName || user.email);
            setSelectedRoom(null);
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#f4c025] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('staff_portal.my_rooms')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('staff_portal.rooms_assigned_desc')}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#161616] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                    <input
                        className="w-full bg-gray-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-[#f4c025]/50 transition-all font-medium"
                        placeholder={t('staff_portal.search_room')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['all', 'dirty', 'cleaning', 'maintenance', 'available'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === s
                                ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/10'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-700'}`}
                        >
                            {t(`common.${s.replace('_', ' ')}`, { defaultValue: s.replace('_', ' ') })}
                        </button>
                    ))}
                </div>
            </div>

            {filteredRooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRooms.map((room) => (
                        <div key={room.id} className="relative group">
                            <RoomCard
                                room={room}
                                onClick={handleRoomClick}
                            />

                            {/* Quick Action Overlay for Staff */}
                            {selectedRoom?.id === room.id && (
                                <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 gap-3 animate-in fade-in zoom-in-95 duration-200">
                                    <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-widest">{t('staff_portal.update_room')} {room.number}</h4>
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        <button
                                            onClick={() => handleQuickStatusUpdate(room.id, 'cleaning')}
                                            className="bg-status-cleaning text-black text-[10px] font-black py-2 rounded-lg hover:scale-105 transition-transform"
                                        >
                                            {t('staff_portal.set_cleaning')}
                                        </button>
                                        <button
                                            onClick={() => handleQuickStatusUpdate(room.id, 'available')}
                                            className="bg-status-ready text-white text-[10px] font-black py-2 rounded-lg hover:scale-105 transition-transform"
                                        >
                                            {t('staff_portal.set_ready')}
                                        </button>
                                        <button
                                            onClick={() => handleQuickStatusUpdate(room.id, 'dirty')}
                                            className="bg-status-dirty text-white text-[10px] font-black py-2 rounded-lg hover:scale-105 transition-transform"
                                        >
                                            {t('staff_portal.set_dirty')}
                                        </button>
                                        <button
                                            onClick={() => setSelectedRoom(null)}
                                            className="bg-white/20 text-white text-[10px] font-black py-2 rounded-lg border border-white/20"
                                        >
                                            {t('staff_portal.cancel')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-white/[0.02] rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5">
                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-6xl mb-4">hotel_class</span>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">{t('staff_portal.no_rooms_assigned')}</p>
                </div>
            )}
        </div>
    );
};

export default StaffRooms;

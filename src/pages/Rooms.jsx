import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoomTable from '../components/RoomTable';
import RoomModal from '../components/RoomModal';
import { subscribeToRooms } from '../services/roomService';
import { subscribeToRoomTypes, addRoomType, deleteRoomType, initializeDefaultRoomTypes } from '../services/roomTypeService';
import { subscribeToStaff } from '../services/staffService';

const Rooms = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'types'
    const [searchTerm, setSearchTerm] = useState('');
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newTypeName, setNewTypeName] = useState('');

    useEffect(() => {
        const unsubscribeRooms = subscribeToRooms((data) => {
            setRooms(data);
            setLoading(false);
        });

        const unsubscribeTypes = subscribeToRoomTypes((data) => {
            setRoomTypes(data);
            if (data.length === 0 && !loading) {
                initializeDefaultRoomTypes(data);
            }
        });

        const unsubscribeStaff = subscribeToStaff((data) => {
            setStaffList(data);
        });

        return () => {
            unsubscribeRooms();
            unsubscribeTypes();
            unsubscribeStaff();
        };
    }, [loading]);

    const handleAddType = async (e) => {
        e.preventDefault();
        if (!newTypeName.trim()) return;
        try {
            await addRoomType(newTypeName.trim());
            setNewTypeName('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteType = async (typeId) => {
        if (window.confirm('Hapus tipe kamar ini? Kamar yang menggunakan tipe ini tidak akan berubah tapi kategorinya akan hilang dari pilihan.')) {
            try {
                await deleteRoomType(typeId);
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Room Inventory...</p>
            </div>
        );
    }

    return (
        <div className="transition-colors duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
                <div>
                    <p className="text-primary font-display italic text-lg mb-1">{t('rooms.accommodation_management')}</p>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('rooms.room_directory')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center gap-2 font-medium">
                        {t('rooms.manage_monitor')}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full lg:w-auto">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex-1 lg:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'inventory' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500'}`}
                    >
                        Room Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('types')}
                        className={`flex-1 lg:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'types' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500'}`}
                    >
                        Room Types
                    </button>
                </div>
            </div>

            {activeTab === 'inventory' ? (
                <>
                    <div className="bg-white/80 dark:bg-surface-darker/90 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-xl backdrop-blur-md transition-colors duration-300 mb-6 mt-4">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                            <div className="w-full lg:w-96 relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input
                                    className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder={t('rooms.search_rooms')} font-medium outline-none focus:ring-1 focus:ring-primary transition-all"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('rooms.search_rooms')}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setSelectedRoom(null); setIsModalOpen(true); }}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-black font-extrabold text-xs tracking-widest uppercase transition-all shadow-md active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    {t('rooms.add_room')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <RoomTable
                        rooms={searchTerm ? rooms.filter(r => r.number.includes(searchTerm)) : rooms}
                        onEdit={(room) => { setSelectedRoom(room); setIsModalOpen(true); }}
                    />
                </>
            ) : (
                /* Room Types management UI */
                <div className="mt-8 max-w-2xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Tambah Tipe Kamar Baru</h3>
                        <form onSubmit={handleAddType} className="flex gap-3">
                            <input
                                type="text"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                placeholder="Nama Tipe (misal: Deluxe Ocean View)"
                                className="flex-1 bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                            />
                            <button type="submit" className="bg-primary text-black px-6 py-2.5 rounded-xl font-extrabold text-sm hover:bg-primary-dark transition-all shadow-lg active:scale-95">
                                TAMBAH
                            </button>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-surface-darker border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Type Name</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Rooms Count</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {roomTypes.map(type => (
                                    <tr key={type.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{type.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-gray-500">{rooms.filter(r => r.type === type.name).length} rooms</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteType(type.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <RoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                room={selectedRoom}
                roomTypes={roomTypes}
                staffList={staffList}
            />
        </div>
    );
};

export default Rooms;

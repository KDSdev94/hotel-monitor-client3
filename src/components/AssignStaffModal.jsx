import { useState, useMemo } from 'react';
import Modal from './Modal';
import { updateRoom } from '../services/roomService';
import { createTask } from '../services/taskService';

const AssignStaffModal = ({ isOpen, onClose, room, staffList = [] }) => {
    const [selectedStaffId, setSelectedStaffId] = useState(room?.staff?.id || '');
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    // Reset state setiap kali modal dibuka dengan room baru
    const currentStaffId = room?.staff?.id || '';

    const filteredStaff = useMemo(() => {
        if (!search.trim()) return staffList;
        return staffList.filter(s =>
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.role?.toLowerCase().includes(search.toLowerCase())
        );
    }, [staffList, search]);

    const selectedStaff = staffList.find(s => s.id === selectedStaffId);

    const statusColor = (status) => {
        switch (status) {
            case 'Online':
            case 'On Duty':
                return 'bg-status-ready/10 text-status-ready border-status-ready/20';
            case 'Sedang Bertugas':
            case 'Cleaning':
                return 'bg-status-cleaning/10 text-status-cleaning border-status-cleaning/20';
            case 'On Break':
                return 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-gray-400';
        }
    };

    const handleSave = async () => {
        if (!room?.id) return;
        setSaving(true);
        try {
            const staffToAssign = selectedStaffId
                ? staffList.find(s => s.id === selectedStaffId) || null
                : null;

            await updateRoom(room.id, {
                staff: staffToAssign
                    ? { id: staffToAssign.id, name: staffToAssign.name, role: staffToAssign.role, avatar: staffToAssign.avatar || '' }
                    : null,
            });

            // Buat task jika ada staff baru yang di-assign
            if (staffToAssign && staffToAssign.id !== currentStaffId) {
                await createTask({
                    roomId: room.id,
                    roomNumber: room.number,
                    staffId: staffToAssign.id,
                    assignedStaffId: staffToAssign.uid || staffToAssign.id, // Gunakan UID jika akun sudah aktif
                    staffName: staffToAssign.name,
                    type: 'inspection',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                });
            }

            onClose();
        } catch (err) {
            console.error('Error assigning staff:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setSearch('');
        setSelectedStaffId(currentStaffId);
        onClose();
    };

    if (!room) return null;

    const footer = (
        <div className="flex justify-end gap-3">
            <button
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
            >
                Batal
            </button>
            {selectedStaffId && selectedStaffId !== currentStaffId && (
                <button
                    onClick={() => setSelectedStaffId('')}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                >
                    Hapus Assign
                </button>
            )}
            <button
                onClick={handleSave}
                disabled={saving || selectedStaffId === currentStaffId}
                className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {saving ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        Simpan
                    </>
                )}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">assignment_ind</span>
                    <span>Assign Staff — Kamar {room.number}</span>
                </div>
            }
            footer={footer}
        >
            {/* Room Info Banner */}
            <div className="mb-5 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-3">
                {room.imageURL ? (
                    <img src={room.imageURL} alt={`Room ${room.number}`} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-gray-400 text-2xl">bed</span>
                    </div>
                )}
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Kamar</p>
                    <p className="text-2xl font-display font-black text-gray-900 dark:text-white">{room.number}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{room.type} {room.floor ? `• Lantai ${room.floor}` : ''}</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Staff Saat Ini</p>
                    {room.staff ? (
                        <div className="flex items-center gap-1.5 justify-end">
                            <div
                                className="w-5 h-5 rounded-full bg-cover bg-center border border-gray-200 dark:border-white/10 bg-gray-200"
                                style={{ backgroundImage: room.staff.avatar ? `url(${room.staff.avatar})` : 'none' }}
                            />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{room.staff.name}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 italic">Belum ada</span>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input
                    type="text"
                    placeholder="Cari nama atau role staff..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
            </div>

            {/* Staff List */}
            <div className="space-y-2">
                {/* Opsi "Tidak ada staff" */}
                <button
                    onClick={() => setSelectedStaffId('')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedStaffId === ''
                            ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                            : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                >
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-gray-400 text-[18px]">person_off</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Tidak Ada Staff</p>
                        <p className="text-xs text-gray-400">Hapus assignment dari kamar ini</p>
                    </div>
                    {selectedStaffId === '' && (
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    )}
                </button>

                {filteredStaff.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-6 italic">
                        {search ? `Tidak ada staff dengan nama "${search}"` : 'Belum ada staff tersedia'}
                    </p>
                ) : (
                    filteredStaff.map((s) => {
                        const isSelected = selectedStaffId === s.id;
                        const isCurrent = currentStaffId === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setSelectedStaffId(s.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected
                                        ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                                        : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-[#242424] dark:bg-[#1a1a1a] overflow-hidden flex-shrink-0 flex items-center justify-center ring-2 ring-primary/10">
                                    {s.avatar && !s.avatar.includes('pravatar.cc') ? (
                                        <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-primary font-display font-black text-sm drop-shadow-[0_0_5px_rgba(244,192,37,0.3)]">
                                            {s.name?.charAt(0)}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{s.name}</p>
                                        {isCurrent && (
                                            <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                Saat ini
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.role}</p>
                                </div>

                                {/* Status & check */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor(s.status)}`}>
                                        {s.status || 'Offline'}
                                    </span>
                                    {isSelected && (
                                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Summary */}
            {selectedStaffId && selectedStaffId !== currentStaffId && (
                <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-bold text-primary">{selectedStaff?.name}</span> akan di-assign ke kamar{' '}
                        <span className="font-bold">{room.number}</span> dan task inspeksi akan dibuat otomatis.
                    </p>
                </div>
            )}
        </Modal>
    );
};

export default AssignStaffModal;

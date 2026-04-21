import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { addRoom, updateRoom } from '../services/roomService';
import { createTask } from '../services/taskService';
import {
    createAdminAssignmentNotification,
    createStaffAssignmentNotification
} from '../services/notificationService';
import { getTaskTypeFromRoomStatus, getTaskTypeLabel } from '../utils/taskHelpers';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const RoomModal = ({ isOpen, onClose, room, roomTypes = [], staffList = [] }) => {
    const { t } = useTranslation();
    const { user, role } = useAuth();
    const defaultType = roomTypes.length > 0 ? roomTypes[0].name : 'Standard';

    const [formData, setFormData] = useState({
        number: '',
        type: defaultType,
        floor: '1',
        status: 'available',
        imageURL: '',
        staff: null
    });

    useEffect(() => {
        if (room) {
            setFormData({
                number: room.number || '',
                type: room.type || defaultType,
                floor: room.floor || '1',
                status: room.status || 'available',
                imageURL: room.imageURL || '',
                staff: room.staff || null
            });
        } else {
            setFormData({
                number: '',
                type: defaultType,
                floor: '1',
                status: 'available',
                imageURL: '',
                staff: null
            });
        }
    }, [room, isOpen, roomTypes]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(room ? t('common.saving', { defaultValue: 'Saving...' }) : t('common.adding', { defaultValue: 'Adding...' }));
        try {
            const senderName = user?.displayName || user?.fullName || user?.email || 'Admin';
            const assignedStaff = formData.staff
                ? {
                    id: formData.staff.id,
                    uid: formData.staff.uid || null,
                    name: formData.staff.name || formData.staff.fullName || '',
                    role: formData.staff.role || 'staff',
                    avatar: formData.staff.avatar || '',
                    phone: formData.staff.phone || ''
                }
                : null;
            const taskType = getTaskTypeFromRoomStatus(formData.status);
            let roomId = room?.id;
            const isNewRoom = !roomId;
            const roomPayload = {
                ...formData,
                staff: assignedStaff,
                assignedStaffId: assignedStaff?.uid || null
            };

            if (roomId) {
                await updateRoom(roomId, roomPayload);
                toast.success(`${t('rooms.room', { defaultValue: 'Room' })} ${formData.number} ${t('common.updated_successfully', { defaultValue: 'updated successfully.' })}`, { id: loadingToast });
            } else {
                const docRef = await addRoom(roomPayload);
                roomId = docRef.id;
                toast.success(`${t('rooms.room', { defaultValue: 'Room' })} ${formData.number} ${t('common.added_successfully', { defaultValue: 'added successfully.' })}`, { id: loadingToast });
            }

            // AUTO-TASK GENERATION LOGIC (Plan step 2)
            // If staff is assigned and status is pending_inspection (or any status that needs action)
            if (assignedStaff) {
                // Check if staff changed or it's a new assignment
                const isStaffChanged = isNewRoom || (room?.staff?.id !== assignedStaff.id);

                if (isStaffChanged) {
                    const taskId = await createTask({
                        roomId: roomId,
                        roomNumber: formData.number,
                        staffId: assignedStaff.id,
                        assignedStaffId: assignedStaff.uid || assignedStaff.id,
                        recipientUid: assignedStaff.uid || null,
                        staffName: assignedStaff.name,
                        assignedByUid: user?.uid || null,
                        assignedByName: senderName,
                        type: taskType,
                        status: 'pending',
                        note: `${getTaskTypeLabel(taskType)} ditugaskan oleh ${senderName}.`
                    });

                    await createStaffAssignmentNotification({
                        recipientUid: assignedStaff.uid || null,
                        recipientStaffId: assignedStaff.id,
                        roomId,
                        roomNumber: formData.number,
                        taskId,
                        taskType,
                        sender: {
                            uid: user?.uid || null,
                            name: senderName,
                            role: role || 'admin'
                        }
                    });

                    await createAdminAssignmentNotification({
                        roomId,
                        roomNumber: formData.number,
                        taskId,
                        taskType,
                        assignedStaff,
                        sender: {
                            uid: user?.uid || null,
                            name: senderName,
                            role: role || 'admin'
                        }
                    });

                    toast.success(`${t('staff.assigned_to', { defaultValue: 'Assigned to' })} ${assignedStaff.name}`);

                    if (!assignedStaff.uid) {
                        toast.error('Staff belum punya akun aktif, jadi notifikasi personal belum bisa dikirim.');
                    }
                }
            }

            onClose();
        } catch (error) {
            console.error("Failed to save room:", error);
            toast.error(t('common.error_saving', { defaultValue: 'Failed to save data.' }), { id: loadingToast });
        }
    };

    const handleStaffChange = (staffId) => {
        if (!staffId) {
            setFormData({ ...formData, staff: null });
            return;
        }
        const selectedStaff = staffList.find(s => s.id === staffId);
        setFormData({ ...formData, staff: selectedStaff || null });
    };

    const footer = (
        <div className="flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-black font-extrabold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
                {room ? t('common.save', { defaultValue: 'Save Changes' }) : t('common.add', { defaultValue: 'Add Room' })}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={room ? t('rooms.edit_room', { defaultValue: 'Edit Room' }) : t('rooms.add_room', { defaultValue: 'Add New Room' })}
            footer={footer}
        >
            <form className="space-y-4" onSubmit={handleSubmit}>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                            {t('common.room', { defaultValue: 'Room' })} {t('common.number', { defaultValue: 'Number' })}
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            placeholder="e.g. 101"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">{t('common.floor', { defaultValue: 'Floor' })}</label>
                        <input
                            type="number"
                            className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.floor}
                            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">{t('common.type', { defaultValue: 'Type' })}</label>
                        <select
                            className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            {roomTypes.map(type => (
                                <option key={type.id} value={type.name}>{type.name}</option>
                            ))}
                            {roomTypes.length === 0 && <option value="Standard">Standard</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">{t('common.status', { defaultValue: 'Status' })}</label>
                        <select
                            className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="dirty">Dirty</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                </div>

                {/* Staff Assignment */}
                <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
                        {t('rooms.assign_staff', { defaultValue: 'Assign Staff Member' })}
                    </label>
                    <div className="relative group">
                        <select
                            className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                            value={formData.staff?.id || ''}
                            onChange={(e) => handleStaffChange(e.target.value)}
                        >
                            <option value="">-- {t('dashboard.pending', { defaultValue: 'Pending Assignment' })} --</option>
                            {staffList.map(staff => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.name} ({staff.role})
                                </option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-primary transition-colors">
                            expand_more
                        </span>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500 font-medium italic">
                        {t('rooms.assign_staff_desc', { defaultValue: 'This staff member will be responsible for cleaning/maintaining this room.' })}
                    </p>
                </div>
            </form>
        </Modal>
    );
};

export default RoomModal;

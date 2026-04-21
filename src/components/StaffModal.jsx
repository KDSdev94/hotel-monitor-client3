import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { addStaff, updateStaff } from '../services/staffService';
import { toast } from 'react-hot-toast';

const StaffModal = ({ isOpen, onClose, staff, roles = [] }) => {
    const { t } = useTranslation();
    const defaultRole = roles.length > 0 ? roles[0].name : 'Housekeeping';

    const [formData, setFormData] = useState({
        name: '',
        role: defaultRole,
        shift: 'Morning',
        status: 'Online',
        avatar: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (staff) {
            setFormData({
                name: staff.name || '',
                role: staff.role || defaultRole,
                shift: staff.shift || 'Morning',
                status: staff.status || 'Online',
                avatar: staff.avatar || '',
                email: staff.email || '',
                phone: staff.phone || ''
            });
        } else {
            setFormData({
                name: '',
                role: defaultRole,
                shift: 'Morning',
                status: 'Online',
                avatar: '',
                email: '',
                phone: ''
            });
        }
    }, [staff, isOpen, roles]);

    const handlePhoneChange = (val) => {
        // Only numbers
        let clean = val.replace(/[^0-9]/g, '');

        // Auto convert 08 -> 628
        if (clean.startsWith('08')) {
            clean = '628' + clean.substring(2);
        }

        setFormData({ ...formData, phone: clean });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name) {
            toast.error(t('staff.error_name_required', { defaultValue: 'Full name is required.' }));
            return;
        }

        const loadingToast = toast.loading(staff ? t('common.saving', { defaultValue: 'Saving...' }) : t('common.adding', { defaultValue: 'Adding...' }));
        try {
            if (staff?.id) {
                await updateStaff(staff.id, formData);
                toast.success(`${t('staff.staff', { defaultValue: 'Staff' })} ${formData.name} ${t('common.updated_successfully', { defaultValue: 'updated successfully.' })}`, { id: loadingToast });
            } else {
                await addStaff(formData);
                toast.success(`${t('staff.staff', { defaultValue: 'Staff' })} ${formData.name} ${t('common.added_successfully', { defaultValue: 'added successfully.' })}`, { id: loadingToast });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save staff:", error);
            toast.error(t('common.error_saving', { defaultValue: 'Failed to save data.' }), { id: loadingToast });
        }
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
                {staff ? t('common.save', { defaultValue: 'Save Changes' }) : t('staff.add_staff', { defaultValue: 'Add Staff' })}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={staff ? t('staff.edit_staff', { defaultValue: 'Edit Staff' }) : t('staff.add_staff', { defaultValue: 'Add New Staff' })}
            footer={footer}
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex justify-center mb-6 pt-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-[#242424] dark:bg-[#1a1a1a] flex items-center justify-center ring-4 ring-primary/10 shadow-2xl relative">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/10 to-transparent text-primary font-display font-black text-4xl">
                            {formData.name?.charAt(0) || 'S'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Maria Sanchez"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="staff@hotel.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                        Phone / WhatsApp (Optional)
                    </label>
                    <input
                        type="tel"
                        className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="6281234567890"
                    />
                    <p className="text-[9px] text-gray-400 mt-1 italic uppercase tracking-widest">Minimal 10 digits, numbers only. Auto-converts 08 to 628.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Role</label>
                        <select
                            className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            {roles.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                            {roles.length === 0 && <option value="Housekeeping">Housekeeping</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Shift</label>
                        <select
                            className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.shift}
                            onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                        >
                            <option value="Morning">Morning</option>
                            <option value="Evening">Evening</option>
                            <option value="Night">Night</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">{t('common.status', { defaultValue: 'Status' })}</label>
                    <select
                        className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Online">Online</option>
                        <option value="On Duty">On Duty</option>
                        <option value="On Break">On Break</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
            </form>
        </Modal>
    );
};

export default StaffModal;

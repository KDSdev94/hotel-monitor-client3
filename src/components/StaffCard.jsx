import { useTranslation } from 'react-i18next';
import { deleteStaff } from '../services/staffService';

const StaffCard = ({ staff, onEdit }) => {
    const { t } = useTranslation();
    const { name, role, avatar, status, currentTask, shiftStart, performance, rating, phone } = staff;

    const handleWhatsAppRedirect = () => {
        if (!phone) {
            alert(t('staff.no_phone', { defaultValue: 'Phone number not found for this staff.' }));
            return;
        }

        // Ensure phone starts with 62
        let formattedPhone = phone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.substring(1);
        }
        const message = encodeURIComponent(t('rooms.whatsapp_message', {
            defaultValue: `Hello {{name}},\nThere is a task for room management.\nPlease follow up immediately.\n\nThank you.`,
            name: name
        }));
        const url = `https://wa.me/${formattedPhone}?text=${message}`;
        window.open(url, '_blank');
    };

    const statusConfig = {
        Online: 'bg-status-ready border-status-ready',
        'On Duty': 'bg-primary border-primary',
        'On Break': 'bg-yellow-500 border-yellow-500',
        Offline: 'bg-gray-500 border-gray-600',
        'Sedang Bertugas': 'bg-primary border-primary',
        'Sedang Istirahat': 'bg-yellow-500 border-yellow-500',
    };

    const statusLabelConfig = {
        Online: 'bg-status-ready/10 text-status-ready border-status-ready/20',
        'On Duty': 'bg-primary/10 text-primary border-primary/20',
        'On Break': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        Offline: 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600',
        'Sedang Bertugas': 'bg-primary/10 text-primary border-primary/20',
        'Sedang Istirahat': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    };

    const isOffline = status === 'Offline' || status === 'offline';

    return (
        <div className={`group bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all shadow-md dark:shadow-lg hover:shadow-2xl ${isOffline ? 'opacity-80 grayscale hover:grayscale-0 hover:opacity-100' : ''} transition-colors duration-300`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                        <div
                            className={`w-16 h-16 rounded-full overflow-hidden border-2 p-0.5 shadow-sm transition-all duration-500 group-hover:scale-105 flex items-center justify-center ${statusConfig[status] || 'border-gray-600'}`}
                        >
                            {avatar && !avatar.includes('pravatar.cc') ? (
                                <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[#242424] dark:bg-[#1a1a1a] flex items-center justify-center">
                                    <span className="text-primary font-display font-black text-xl drop-shadow-[0_0_8px_rgba(244,192,37,0.3)]">{name?.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white dark:border-surface-dark rounded-full shadow-sm ${status === 'Online' || status === 'On Duty' || status === 'Sedang Bertugas' ? 'bg-status-ready' : status === 'On Break' || status === 'Sedang Istirahat' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${statusLabelConfig[status] || ''}`}>
                        {t(`common.${status?.toLowerCase().replace(' ', '_') || 'offline'}`, { defaultValue: status || 'Offline' })}
                    </span>
                </div>

                <div>
                    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-0.5 tracking-tight">{name}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-extrabold uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[16px] text-primary font-bold">
                            {role?.includes('Housekeeping') ? 'cleaning_services' : 'build'}
                        </span>
                        {t(`common.${role?.toLowerCase().replace(' ', '_') || 'staff'}`, { defaultValue: role || 'Staff' })}
                    </p>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-xs border-b border-gray-50 dark:border-gray-700 pb-2">
                        <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{t('staff.current_task', { defaultValue: 'Current Task' })}</span>
                        <span className={`font-bold ${currentTask ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600 italic'}`}>{currentTask || t('staff.no_task', { defaultValue: 'No tasks' })}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-gray-50 dark:border-gray-700 pb-2">
                        <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{isOffline ? t('staff.last_active', { defaultValue: 'Last Active' }) : t('staff.shift_started', { defaultValue: 'Shift Started' })}</span>
                        <span className={`font-bold ${(isOffline || shiftStart) ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600 italic'}`}>{isOffline ? t('common.yesterday', { defaultValue: 'Yesterday' }) : (shiftStart || t('staff.not_started', { defaultValue: 'Not started' }))}</span>
                    </div>
                    <div className="flex justify-between text-xs transition-all group-hover:bg-primary/5 p-1 rounded">
                        <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{t('reports.efficiency_score', { defaultValue: 'Performance' })}</span>
                        <span className={`font-black ${(rating || performance) ? 'text-status-ready' : 'text-gray-400 dark:text-gray-600 italic font-bold'}`}>{rating || performance || '-'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-surface-darker px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-opacity-50 transition-colors duration-300">
                <button className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] font-bold">history</span>
                    {t('staff.history', { defaultValue: 'History' })}
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleWhatsAppRedirect}
                        className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-all transform hover:scale-110 active:scale-95"
                        title="Contact via WhatsApp"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.006.332.009c.109.004.258-.045.405.314.144.354.491 1.196.534 1.282.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.101-.177.211-.077.382.101.171.445.733.954 1.187.654.582 1.203.763 1.376.849s.275.058.376-.058c.101-.116.434-.506.549-.68.116-.173.231-.144.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zM12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onEdit(staff)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
                        title={t('profile.settings')}
                    >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                        onClick={async () => {
                            if (window.confirm(t('common.confirm_delete', { defaultValue: 'Are you sure?' }))) {
                                await deleteStaff(staff.id);
                            }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all"
                        title="Delete"
                    >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffCard;

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToRooms } from '../../services/roomService';
import { reportIssue, subscribeToStaffIssues } from '../../services/issueService';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

const priorityOptions = [
    { value: 'low', color: '#00b894' },
    { value: 'medium', color: '#f4c025' },
    { value: 'high', color: '#e17055' },
    { value: 'critical', color: '#d63031' },
];

const StaffIssues = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ roomNumber: '', description: '', priority: 'medium' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        const unsubRooms = subscribeToRooms((data) => {
            const assignedRooms = data.filter(room =>
                room.assignedStaffId === user?.uid ||
                room.staff?.uid === user?.uid ||
                room.staff?.id === user?.uid
            );
            setRooms(assignedRooms);
        });
        const unsubIssues = user?.uid ? subscribeToStaffIssues(user.uid, (data) => {
            setIssues(data);
            setLoading(false);
        }) : () => { };

        return () => {
            unsubRooms();
            unsubIssues();
        };
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.roomNumber || !formData.description.trim()) return;

        setIsSubmitting(true);
        try {
            await reportIssue({
                roomNumber: formData.roomNumber,
                description: formData.description,
                priority: formData.priority,
                reportedBy: user.uid,
                staffName: user.displayName || 'Staff'
            });

            setFormData({ roomNumber: '', description: '', priority: 'medium' });
            setCharCount(0);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to report issue:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredIssues = filterStatus === 'all'
        ? issues
        : issues.filter(i => i.status === filterStatus);

    const priorityStyle = (priority) => {
        const p = priorityOptions.find(o => o.value === priority);
        return p ? { color: p.color, backgroundColor: `${p.color}12` } : {};
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#f4c025] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('staff_portal.report_issue_title')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('staff_portal.report_issue_desc')}
                </p>
            </div>

            {showSuccess && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200 dark:border-emerald-500/15 text-emerald-700 dark:text-emerald-400 transition-all duration-300">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <div>
                        <p className="text-[13px] font-bold">{t('staff_portal.report_sent')}</p>
                        <p className="text-[11px] opacity-70 mt-0.5">{t('staff_portal.admin_notified')}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#161616] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-[20px] text-[#f4c025]">edit_note</span>
                    <h2 className="text-base font-display font-bold text-gray-900 dark:text-white">{t('staff_portal.new_report_form')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.select_room')}</label>
                        <select
                            className="w-full bg-gray-50 dark:bg-[#1f1f1f] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-white font-medium outline-none focus:ring-1 focus:ring-[#f4c025]/50 transition-all [&>option]:bg-white dark:[&>option]:bg-[#1f1f1f] dark:[&>option]:text-white"
                            value={formData.roomNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                        >
                            <option value="">-- Pilih Kamar --</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.number}>{room.number} - {room.type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.priority_level')}</label>
                        <div className="flex gap-2">
                            {priorityOptions.map(p => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                                    className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all duration-280 ${formData.priority === p.value
                                        ? 'border-current shadow-sm'
                                        : 'border-black/[0.06] dark:border-white/[0.06] text-gray-400'
                                        }`}
                                    style={formData.priority === p.value ? { color: p.color, backgroundColor: `${p.color}08`, borderColor: `${p.color}40` } : {}}
                                >
                                    {t(`staff_portal.priority_${p.value}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-5">
                    <label className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600">{t('staff_portal.issue_description')}</span>
                        <span className="text-[10px] font-bold text-gray-300">{charCount}/500</span>
                    </label>
                    <textarea
                        className="w-full bg-gray-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3.5 py-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-[#f4c025]/50 outline-none font-medium resize-none transition-all leading-relaxed"
                        placeholder="Contoh: AC bocor, lampu kamar mandi mati, dll..."
                        rows={4}
                        maxLength={500}
                        value={formData.description}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, description: e.target.value }));
                            setCharCount(e.target.value.length);
                        }}
                    />
                </div>

                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={!formData.roomNumber || !formData.description.trim() || isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#f4c025] text-black text-[13px] font-bold disabled:opacity-40 hover:bg-[#d4a015] transition-all"
                    >
                        {isSubmitting ? t('staff_portal.submitting') : t('staff_portal.submit_report')}
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">{t('staff_portal.report_history')}</h2>
                <div className="space-y-3">
                    {filteredIssues.map(issue => (
                        <div key={issue.id} className="bg-white dark:bg-[#161616] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center font-bold text-[#f4c025]">
                                        {issue.roomNumber}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md" style={priorityStyle(issue.priority)}>
                                                {issue.priority}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {issue.createdAt?.toDate ? formatDistanceToNow(issue.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                    {issue.status}
                                </span>
                            </div>
                            <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed ml-[52px]">
                                {issue.description}
                            </p>
                        </div>
                    ))}
                    {filteredIssues.length === 0 && (
                        <div className="py-12 text-center bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                        <p className="text-sm text-gray-400 font-medium">{t('staff_portal.no_report_history')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffIssues;

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToStaffTasks, updateTaskStatus } from '../../services/taskService';
import { updateRoomStatus } from '../../services/roomService';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

const priorityConfig = {
    high: { color: '#e17055', bg: 'bg-red-500/8', icon: 'priority_high' },
    medium: { color: '#f4c025', bg: 'bg-[#f4c025]/8', icon: 'drag_handle' },
    low: { color: '#00b894', bg: 'bg-emerald-500/8', icon: 'keyboard_arrow_down' },
};

const StaffTasks = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedTask, setExpandedTask] = useState(null);

    const statusTabs = [
        { id: 'all', label: 'All Tasks' },
        { id: 'pending', label: 'Pending' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
    ];

    useEffect(() => {
        if (!user?.uid) return;

        const unsub = subscribeToStaffTasks(user.uid, (data) => {
            setTasks(data);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    const filteredTasks = activeTab === 'all'
        ? tasks
        : tasks.filter(t => t.status === activeTab);

    const counts = {
        all: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
    };

    const handleUpdateStatus = async (task, newStatus) => {
        try {
            await updateTaskStatus(task.id, newStatus);

            // Auto-update room status if completed
            if (newStatus === 'completed') {
                if (task.type === 'inspection' || task.type === 'cleaning') {
                    await updateRoomStatus(task.roomId, 'available', user.displayName || user.email);
                }
            }
        } catch (err) {
            console.error("Failed to update task:", err);
        }
    };

    const getStatusDot = (status) => {
        switch (status) {
            case 'pending': return 'bg-gray-400';
            case 'in_progress': return 'bg-[#f4c025]';
            case 'completed': return 'bg-emerald-500';
            default: return 'bg-gray-400';
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
        <div className="max-w-[1000px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('staff_portal.my_tasks')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="text-[#f4c025] font-bold">{counts.pending + counts.in_progress}</span> {t('staff_portal.tasks_assigned')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px] text-emerald-500">check</span>
                        </span>
                        {counts.completed} {t('staff_portal.n_completed')}
                    </div>
                </div>
            </div>

            <div className="flex gap-1.5 bg-gray-100 dark:bg-white/[0.04] rounded-xl p-1.5">
                {statusTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-2 rounded-lg text-[12px] font-bold transition-all duration-280 ${activeTab === tab.id
                            ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {t(`staff_portal.${tab.id === 'in_progress' ? 'in_progress' : tab.id === 'all' ? 'all_tasks' : tab.id === 'pending' ? 'pending' : 'completed'}`)}
                        <span className={`ml-1.5 text-[10px] ${activeTab === tab.id ? 'text-[#f4c025]' : ''}`}>
                            {counts[tab.id]}
                        </span>
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {filteredTasks.map((task) => {
                    const pConfig = priorityConfig[task.priority] || priorityConfig.medium;
                    const isExpanded = expandedTask === task.id;
                    const isDone = task.status === 'completed';
                    const timeAgo = task.createdAt?.toDate ? formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true }) : 'Just now';

                    return (
                        <div
                            key={task.id}
                            className={`bg-white dark:bg-[#161616] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden transition-all duration-280 ${isDone ? 'opacity-60' : 'hover:border-black/[0.08] dark:hover:border-white/[0.08]'}`}
                        >
                            <div
                                className="flex items-center gap-4 p-4 md:p-5 cursor-pointer"
                                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${pConfig.color}10` }}
                                >
                                    <span className="text-[14px] font-display font-bold" style={{ color: pConfig.color }}>{task.roomNumber || task.roomId}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className={`text-[14px] font-bold ${isDone ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                            {task.type}
                                        </span>
                                        <span
                                            className="text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-md"
                                            style={{ color: pConfig.color, backgroundColor: `${pConfig.color}12` }}
                                        >
                                            {task.priority || 'medium'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            {timeAgo}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="hidden md:flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(task.status)}`}></span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <span className={`material-symbols-outlined text-[18px] text-gray-300 dark:text-gray-600 transition-transform duration-280 ${isExpanded ? 'rotate-180' : ''}`}>
                                        keyboard_arrow_down
                                    </span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-black/[0.03] dark:border-white/[0.03] pt-4 space-y-4">
                                    {task.note && (
                                        <div className="flex items-start gap-2.5">
                                            <span className="material-symbols-outlined text-[16px] text-gray-400 mt-0.5">sticky_note_2</span>
                                            <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">{task.note}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2.5 md:justify-end">
                                        {task.status === 'pending' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(task, 'in_progress'); }}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f4c025] text-black text-[12px] font-bold hover:bg-[#d4a015] transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                                {t('staff_portal.start_now')}
                                            </button>
                                        )}
                                        {task.status === 'in_progress' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(task, 'completed'); }}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[12px] font-bold hover:bg-emerald-600 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">check</span>
                                                {t('staff_portal.mark_done')}
                                            </button>
                                        )}
                                        {task.status === 'completed' && (
                                            <span className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-500">
                                                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                                                {t('staff_portal.done_at')} {task.updatedAt?.toDate ? formatDistanceToNow(task.updatedAt.toDate(), { addSuffix: true }) : 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="material-symbols-outlined text-[48px] text-gray-300 dark:text-gray-600 mb-3">
                        {activeTab === 'completed' ? 'sentiment_dissatisfied' : 'celebration'}
                    </span>
                    <p className="text-sm font-bold text-gray-400">
                        {activeTab === 'completed' ? t('staff_portal.no_completed_tasks') : t('staff_portal.no_tasks_here')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default StaffTasks;

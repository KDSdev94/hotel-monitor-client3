import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToRooms, updateRoomStatus } from '../../services/roomService';
import { subscribeToStaffTasks, updateTaskStatus } from '../../services/taskService';
import { subscribeToStaffIssues, reportIssue } from '../../services/issueService';
import { useTranslation } from 'react-i18next';

const StaffDashboard = () => {
    const { t } = useTranslation();
    const { user, role } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCards, setVisibleCards] = useState([]);

    useEffect(() => {
        if (!user?.uid) return;

        const unsubRooms = subscribeToRooms(setRooms);
        const unsubTasks = subscribeToStaffTasks(user.uid, (data) => {
            setTasks(data);
            setLoading(false);
        });
        const unsubIssues = subscribeToStaffIssues(user.uid, setIssues);

        return () => {
            unsubRooms();
            unsubTasks();
            unsubIssues();
        };
    }, [user]);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                const ids = ['stat-0', 'stat-1', 'stat-2', 'stat-3', 'tasks', 'actions', 'activity'];
                ids.forEach((id, i) => {
                    setTimeout(() => {
                        setVisibleCards(prev => [...prev, id]);
                    }, i * 80);
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const stats = useMemo(() => [
        {
            id: 'stat-0',
            label: t('staff_portal.dirty_rooms'),
            value: rooms.filter(r => r.status === 'dirty' || r.status === 'cleaning').length,
            icon: 'cleaning_services',
            bg: 'bg-orange-500/10 text-orange-600'
        },
        {
            id: 'stat-1',
            label: t('staff_portal.my_tasks'),
            value: tasks.filter(t => t.status !== 'completed').length,
            icon: 'assignment',
            bg: 'bg-blue-500/10 text-blue-600'
        },
        {
            id: 'stat-2',
            label: t('staff_portal.my_issues'),
            value: issues.filter(i => i.status === 'pending').length,
            icon: 'report_problem',
            bg: 'bg-red-500/10 text-red-600'
        },
        {
            id: 'stat-3',
            label: t('staff_portal.available_rooms'),
            value: rooms.filter(r => r.status === 'available').length,
            icon: 'check_circle',
            bg: 'bg-emerald-500/10 text-emerald-600'
        },
    ], [rooms, tasks, issues]);

    const isVisible = (id) => visibleCards.includes(id);

    const handleStartTask = async (taskId) => {
        try {
            await updateTaskStatus(taskId, 'in_progress', {
                actor: {
                    uid: user?.uid || null,
                    name: user?.displayName || user?.fullName || user?.email || 'Staff',
                    role: role || 'staff'
                }
            });
        } catch (error) {
            console.error("Error starting task:", error);
        }
    };

    const handleCompleteTask = async (task) => {
        if (!window.confirm('Mark this task as completed?')) return;
        try {
            await updateTaskStatus(task.id, 'completed', {
                actor: {
                    uid: user?.uid || null,
                    name: user?.displayName || user?.fullName || user?.email || 'Staff',
                    role: role || 'staff'
                }
            });

            // Auto-update room status based on task type
            if (task.type === 'inspection') {
                await updateRoomStatus(task.roomId, 'available', user.displayName || user.email);
            } else if (task.type === 'cleaning') {
                await updateRoomStatus(task.roomId, 'available', user.displayName || user.email);
            }
        } catch (error) {
            console.error("Error completing task:", error);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#f4c025] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const activeTasks = tasks.filter(t => t.status !== 'completed');

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Greeting */}
            <div className="space-y-1">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                    {t('staff_portal.hello')}, <span className="text-[#f4c025]">{user?.displayName || 'Partner'}</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('staff_portal.shift_summary')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        className={`bg-white dark:bg-[#161616] rounded-2xl p-5 border border-black/[0.04] dark:border-white/[0.04] transition-all duration-500 hover:shadow-xl hover:shadow-black/5 ${isVisible(stat.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                            <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Tasks */}
                <div className={`space-y-4 transition-all duration-500 ${isVisible('tasks') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">{t('staff_portal.active_tasks')}</h2>
                        <button className="text-[12px] font-bold text-[#f4c025] hover:underline">{t('staff_portal.view_all')}</button>
                    </div>

                    <div className="space-y-3">
                        {activeTasks.slice(0, 10).map(task => (
                            <div key={task.id} className="bg-white dark:bg-[#161616] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#f4c025]/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center font-display font-extrabold text-xl text-[#f4c025] border border-black/5 dark:border-white/5">
                                        {task.roomNumber}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{task.type}</p>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ${task.status === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-medium">{t('staff_portal.assigned_at')} {task.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {task.status === 'pending' && (
                                        <button
                                            onClick={() => handleStartTask(task.id)}
                                            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                                        >
                                            {t('staff_portal.start_work')}
                                        </button>
                                    )}
                                    {task.status === 'in_progress' && (
                                        <button
                                            onClick={() => handleCompleteTask(task)}
                                            className="px-4 py-2 bg-[#f4c025] text-black rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#f4c025]/20"
                                        >
                                            {t('staff_portal.complete')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {activeTasks.length === 0 && (
                            <div className="py-16 text-center bg-gray-50 dark:bg-white/[0.02] rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5">
                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-5xl mb-4">task_alt</span>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{t('staff_portal.all_caught_up')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shift Progress (Moved here from Quick Actions) */}
                <div className={`space-y-4 transition-all duration-500 ${isVisible('actions') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">{t('staff_portal.shift_progress')}</h2>
                    <div className="p-8 bg-gradient-to-br from-gray-900 to-black dark:from-[#1a1a1a] dark:to-[#111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative min-h-[200px] flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f4c025]/5 rounded-full blur-3xl"></div>
                        <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-2">{t('staff_portal.overall_completion')}</p>
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-6xl font-display font-black text-[#f4c025]">
                                {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 100}%
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-[#f4c025] h-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,192,37,0.4)]"
                                style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;

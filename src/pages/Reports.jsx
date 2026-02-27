import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusDoughnut } from '../components/ReportChart';
import { subscribeToRoomStats, subscribeToStaffPerformance } from '../services/reportService';

const Reports = () => {
    const { t } = useTranslation();
    const [roomStats, setRoomStats] = useState({ total: 0, available: 0, occupied: 0, cleaning: 0, maintenance: 0 });
    const [staffPerformance, setStaffPerformance] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribeRooms = subscribeToRoomStats((stats) => {
            setRoomStats(stats);
            setLoading(false);
        });
        const unsubscribeStaff = subscribeToStaffPerformance((perf) => setStaffPerformance(perf));

        return () => {
            unsubscribeRooms();
            unsubscribeStaff();
        };
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Generating Performance Insights...</p>
            </div>
        );
    }

    const occupancyRate = roomStats.total > 0 ? Math.round((roomStats.occupied / roomStats.total) * 100) : 0;
    const totalMins = staffPerformance.reduce((acc, s) => acc + parseInt(s.time || 0), 0);
    const avgMins = staffPerformance.length > 0 ? Math.round(totalMins / staffPerformance.length) : 0;
    const activeStaff = staffPerformance.filter(s => s.status === 'On Duty' || s.status === 'Sedang Bertugas').length;

    const metrics = [
        { label: 'Kamar Dibersihkan', value: staffPerformance.reduce((acc, s) => acc + (s.rooms || 0), 0), trend: 'Hari Ini', color: 'text-primary', icon: 'cleaning_services' },
        { label: 'Staf Aktif', value: activeStaff, trend: 'Sedang Bertugas', color: 'text-emerald-500', icon: 'groups' },
        { label: 'Rerata Okupansi', value: `${occupancyRate}%`, trend: 'Database Sync', color: 'text-blue-500', icon: 'bed' },
        { label: 'Rerata Waktu Bersih', value: `${avgMins || 38}m`, trend: 'Target: 45m', color: 'text-status-cleaning', icon: 'schedule', down: avgMins > 45 },
    ];

    return (
        <div className="transition-colors duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <p className="text-primary font-display italic text-lg mb-1">{t('reports.weekly_analysis')}</p>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('reports.performance_reports')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        Realtime Database Sync • {new Date().toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white rounded-lg transition-all text-sm font-bold shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        {t('reports.export_pdf')}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black rounded-lg transition-all text-sm font-bold shadow-lg shadow-primary/20 active:scale-95">
                        <span className="material-symbols-outlined text-[18px]">share</span>
                        {t('reports.share_report')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group transition-colors duration-300">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-symbols-outlined text-6xl ${m.color}`}>{m.icon}</span>
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-bold">{m.label}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-display font-bold text-gray-900 dark:text-white">{m.value}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <span className={`${m.down ? 'bg-status-dirty/10 text-status-dirty' : 'bg-status-ready/10 text-status-ready'} text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-extrabold uppercase`}>
                                {m.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full mt-6 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 p-8 shadow-xl transition-colors duration-300">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

                    {/* Left: Text Info */}
                    <div className="w-full lg:w-1/3 space-y-2 text-center lg:text-left">
                        <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('reports.room_status')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{t('reports.distribution_snapshot')}</p>
                    </div>

                    {/* Middle: Doughnut Chart */}
                    <div className="flex justify-center items-center w-full lg:w-1/3">
                        <div className="relative w-48 h-48">
                            <StatusDoughnut stats={roomStats} />
                            <div className="absolute inset-0 m-auto w-32 h-32 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-display font-black text-gray-900 dark:text-white">{roomStats.total}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold mt-1">{t('common.rooms')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Modern Stats Grid */}
                    <div className="w-full lg:w-1/3 grid grid-cols-2 gap-4">
                        {[
                            { label: 'Tersedia', val: `${roomStats.available}`, color: 'bg-status-ready', text: 'text-status-ready' },
                            { label: 'Kotor', val: `${roomStats.dirty}`, color: 'bg-status-dirty', text: 'text-status-dirty' },
                            { label: 'Pembersihan', val: `${roomStats.cleaning}`, color: 'bg-status-cleaning', text: 'text-status-cleaning' },
                            { label: 'Perbaikan', val: `${roomStats.maintenance}`, color: 'bg-gray-500', text: 'text-gray-500' },
                        ].map((s, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-4 flex flex-col justify-center items-center gap-2 transition-all hover:scale-105 hover:shadow-md cursor-default group">
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${s.color} shadow-sm group-hover:scale-125 transition-transform`}></span>
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{s.label}</span>
                                </div>
                                <span className={`font-display font-black text-2xl ${s.text}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 p-6 mt-6 transition-colors duration-300 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{t('reports.staff_performance_metrics')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('reports.top_performing_desc')}</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                <th className="pb-3 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2">{t('dashboard.staff_member')}</th>
                                <th className="pb-3 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('reports.rooms_cleaned')}</th>
                                <th className="pb-3 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('reports.avg_time')}</th>
                                <th className="pb-3 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('reports.efficiency_score')}</th>
                                <th className="pb-3 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('dashboard.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {staffPerformance.map((s, i) => (
                                <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="py-4 pl-2">
                                        <div className="flex items-center gap-3">
                                            {s.avatar && s.avatar !== '' && !s.avatar.includes('pravatar.cc') ? (
                                                <div
                                                    className="w-8 h-8 rounded-full bg-cover bg-center ring-2 ring-primary/10 transition-transform group-hover:scale-110 shadow-sm"
                                                    style={{ backgroundImage: `url(${s.avatar})` }}
                                                ></div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#242424] dark:bg-[#1a1a1a] flex items-center justify-center ring-2 ring-primary/10 transition-transform group-hover:scale-110 shadow-sm">
                                                    <span className="text-primary font-display font-black text-[10px] drop-shadow-[0_0_5px_rgba(244,192,37,0.3)]">
                                                        {s.name?.charAt(0) || 'S'}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-gray-900 dark:text-white font-bold">{s.name}</p>
                                                <p className="text-[10px] text-gray-400 font-extrabold uppercase">ID: {s.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-900 dark:text-white font-bold">{s.rooms}</td>
                                    <td className="py-4 text-gray-500 dark:text-gray-400 font-bold">{s.time}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden shadow-inner">
                                                <div className={`h-full rounded-full ${s.score > 9 ? 'bg-status-ready shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(244,192,37,0.5)]'}`} style={{ width: `${s.score * 10}%` }}></div>
                                            </div>
                                            <span className={`text-xs font-black ${s.score > 9 ? 'text-status-ready' : 'text-primary'}`}>{s.score}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest ${s.status === 'On Duty' ? 'bg-status-ready/10 text-status-ready' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'}`}>
                                            {t(`common.${s.status.toLowerCase().replace(' ', '_')}`, { defaultValue: s.status })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;

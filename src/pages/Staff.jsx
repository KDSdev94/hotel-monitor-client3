import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import StaffCard from '../components/StaffCard';
import StaffModal from '../components/StaffModal';
import { subscribeToStaff } from '../services/staffService';
import { subscribeToRoles, addRole, deleteRole, initializeDefaultRoles } from '../services/roleService';

const Staff = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'roles'
    const [filter, setFilter] = useState('all');
    const [staffList, setStaffList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newRoleName, setNewRoleName] = useState('');

    useEffect(() => {
        const unsubscribeStaff = subscribeToStaff((data) => {
            setStaffList(data);
            setLoading(false);
        });

        const unsubscribeRoles = subscribeToRoles((data) => {
            setRoles(data);
            if (data.length === 0 && !loading) {
                initializeDefaultRoles(data);
            }
        });

        return () => {
            unsubscribeStaff();
            unsubscribeRoles();
        };
    }, [loading]);

    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        try {
            await addRole(newRoleName.trim());
            setNewRoleName('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (window.confirm('Hapus role ini? Anggota staff dengan role ini mungkin perlu diupdate manual.')) {
            try {
                await deleteRole(roleId);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const filters = [
        { id: 'all', label: t('staff.all_staff'), count: staffList.length },
        ...roles.map(r => ({
            id: r.name,
            label: r.name,
            count: staffList.filter(s => s.role === r.name).length,
            color: 'bg-primary'
        })),
        { id: 'Offline', label: t('staff.offline'), count: staffList.filter(s => s.status === 'Offline').length, color: 'bg-gray-500' },
    ];

    const filteredStaff = filter === 'all'
        ? staffList
        : filter === 'Offline'
            ? staffList.filter(s => s.status === 'Offline')
            : staffList.filter(s => s.role === filter);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Onboarding Local Team...</p>
            </div>
        );
    }

    return (
        <div className="transition-colors duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
                <div>
                    <p className="text-primary font-display italic text-lg mb-1">{t('staff.human_resources')}</p>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('staff.staff_management')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-[16px]">group</span>
                        {t('staff.active_shift')}: {t('staff.morning')} • {staffList.filter(s => s.status !== 'Offline').length} {t('common.on_duty')}
                    </p>
                </div>

                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full lg:w-auto">
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`flex-1 lg:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'staff' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500'}`}
                    >
                        Staff Members
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`flex-1 lg:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'roles' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500'}`}
                    >
                        Role Management
                    </button>
                </div>
            </div>

            {activeTab === 'staff' ? (
                <>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/90 dark:bg-surface-darker/90 p-2 rounded-xl border border-gray-100 dark:border-white/5 sticky top-20 z-40 shadow-xl backdrop-blur-md transition-colors duration-300 mb-6 mt-4">
                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                            {filters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filter === f.id
                                        ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                        : 'bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    {f.color && <span className={`w-2 h-2 rounded-full ${f.color}`}></span>}
                                    <span>{f.label}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${filter === f.id ? 'bg-black/10 text-black font-extrabold' : 'bg-gray-200 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold'
                                        }`}>{f.count}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => { setSelectedStaff(null); setIsModalOpen(true); }}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-black px-4 py-1.5 rounded-lg font-extrabold text-xs tracking-widest uppercase transition-all shadow-md active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            {t('staff.add_staff')}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredStaff.map((staff) => (
                            <StaffCard
                                key={staff.id}
                                staff={staff}
                                onEdit={() => { setSelectedStaff(staff); setIsModalOpen(true); }}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className="mt-8 max-w-2xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tambah Role Baru</h3>
                        <form onSubmit={handleAddRole} className="flex gap-3">
                            <input
                                type="text"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                placeholder="Nama Role (misal: Supervisor)"
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
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Role Name</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Staff Count</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {roles.map(role => (
                                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{role.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-gray-500">{staffList.filter(s => s.role === role.name).length} members</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteRole(role.id)}
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

            <StaffModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                staff={selectedStaff}
                roles={roles}
            />
        </div>
    );
};

export default Staff;

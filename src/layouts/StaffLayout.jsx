import { useState, useCallback } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NotificationDropdown from '../components/NotificationDropdown';
import ProfileDropdown from '../components/ProfileDropdown';
import { getUserDisplayName, getUserInitial } from '../utils/userHelpers';


const StaffLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const { t } = useTranslation();

    const menuItems = [
        { path: '/staff/dashboard', icon: 'space_dashboard', label: t('staff_portal.nav_overview') },
        { path: '/staff/rooms', icon: 'door_open', label: t('staff_portal.nav_rooms') },
        { path: '/staff/tasks', icon: 'task_alt', label: t('staff_portal.nav_tasks') },
        { path: '/staff/issues', icon: 'report_problem', label: t('staff_portal.nav_report') },
        { path: '/staff/profile', icon: 'person', label: t('staff_portal.nav_profile') },
    ];

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout]);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    const currentPage = menuItems.find(item => location.pathname.startsWith(item.path));
    const displayName = getUserDisplayName(user, 'Staff Member');
    const userInitial = getUserInitial(user, 'S');

    return (
        <div className="min-h-screen bg-[#f6f5f0] dark:bg-[#0e0e0e] transition-colors duration-500">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[50] lg:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-[60] h-full w-[260px] bg-[#1c1c1c] dark:bg-[#0a0a0a] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="px-6 pt-8 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-charcoal text-[22px] font-bold">diamond</span>
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold tracking-wide">Hotel Room Monitor</p>
                            <p className="text-[#f4c025] text-[9px] font-bold uppercase tracking-[0.2em]">{t('staff_portal.panel')}</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 mb-6">
                    <div className="bg-white/5 rounded-xl p-3.5 border border-white/[0.04]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4c025] to-[#d4a015] flex items-center justify-center text-black font-bold text-sm">
                                {userInitial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-[13px] font-bold truncate">{displayName}</p>
                                <p className="text-gray-500 text-[10px] font-semibold truncate">{user?.email || 'staff@hotel.com'}</p>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20 flex-shrink-0"></span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600 px-3 mb-3">{t('staff_portal.navigation')}</p>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-280 group ${isActive
                                    ? 'bg-[#f4c025]/10 text-[#f4c025]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-280 ${isActive ? '' : 'group-hover:translate-x-[2px]'}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#f4c025]"></span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="px-4 pb-6 mt-auto space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all duration-280"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                        <span>{theme === 'dark' ? t('common.light_mode', { defaultValue: 'Light Mode' }) : t('common.dark_mode', { defaultValue: 'Dark Mode' })}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-280"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span>{t('staff_portal.sign_out')}</span>
                    </button>
                </div>
            </aside>

            <div className="lg:pl-[260px] min-h-screen flex flex-col">
                <header className="sticky top-0 z-30 bg-[#f6f5f0]/80 dark:bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.04]">
                    <div className="flex items-center justify-between px-5 lg:px-8 h-[60px]">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 -ml-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                aria-label="Open menu"
                            >
                                <span className="material-symbols-outlined text-[22px]">menu</span>
                            </button>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white -mt-0.5">
                                    {currentPage?.label || 'Staff'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <NotificationDropdown />
                            <ProfileDropdown />
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-5 lg:px-8 py-6 lg:py-8">
                    <Outlet />
                </main>

                <footer className="border-t border-black/[0.04] dark:border-white/[0.04] px-5 lg:px-8">
                    <div className="py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-gray-400 dark:text-gray-600">
                        <span>Hotel Room Monitor</span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {t('staff_portal.all_systems')}
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default StaffLayout;

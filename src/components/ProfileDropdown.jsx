import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserDisplayName, getUserInitial } from '../utils/userHelpers';

const ProfileDropdown = () => {
    const { t } = useTranslation();
    const { user, logout, role } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const displayName = getUserDisplayName(user, 'User');
    const displayRole = user?.role === 'admin'
        ? (t('common.dashboard') === 'Dasbor' ? 'Manajer Hotel' : 'Hotel Manager')
        : (user?.role === 'staff' ? (t('common.dashboard') === 'Dasbor' ? 'Staf Lapangan' : 'Field Staff') : (user?.role || role));
    const avatar = user?.photoURL;
    const initial = getUserInitial(user, 'U');

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-gray-200 dark:hover:border-[#444] max-w-[220px]"
            >
                <div className="h-8 w-8 rounded-full overflow-hidden bg-[#242424] dark:bg-[#1a1a1a] flex items-center justify-center ring-2 ring-primary/20 transition-transform group-hover:scale-105">
                    {avatar && !avatar.includes('pravatar.cc') ? (
                        <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-primary font-display font-black text-sm drop-shadow-[0_0_5px_rgba(244,192,37,0.3)]">{initial}</span>
                    )}
                </div>
                <div className="hidden md:block min-w-0 text-left">
                    <p className="text-[12px] font-bold text-gray-900 dark:text-white truncate leading-tight">{displayName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider truncate leading-tight">{displayRole}</p>
                </div>
                <span className="hidden md:block material-symbols-outlined text-gray-400 dark:text-gray-500 text-[18px]">expand_more</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface-dark border border-gray-100 dark:border-[#444] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 transition-colors">
                        <div className="px-4 py-5 bg-gray-50 dark:bg-surface-darker/50 border-b border-gray-100 dark:border-[#444]">
                            <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1.5">{displayName}</p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">{displayRole}</p>
                        </div>

                        <div className="py-2">
                            <NavLink
                                to={user?.role === 'staff' ? '/staff/profile' : '/profile'}
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-bold"
                            >
                                <span className="material-symbols-outlined text-[20px] font-bold">person</span>
                                {t('profile.view_profile')}
                            </NavLink>
                        </div>

                        <div className="border-t border-gray-100 dark:border-[#444] py-2">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-status-dirty font-black hover:bg-status-dirty/5 transition-colors uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined text-[20px] font-black">logout</span>
                                {t('profile.logout')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfileDropdown;

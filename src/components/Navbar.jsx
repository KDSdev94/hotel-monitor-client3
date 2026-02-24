import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { to: '/', label: t('common.dashboard'), icon: 'dashboard' },
        { to: '/rooms', label: t('common.rooms'), icon: 'meeting_room' },
        { to: '/manage-staff', label: t('common.staff'), icon: 'groups' },
        { to: '/reports', label: t('common.reports'), icon: 'assessment' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-[#333] bg-white/80 dark:bg-[#1a1a1a]/95 backdrop-blur-sm transition-colors duration-300">
            <div className="px-5 md:px-6 h-16 flex items-center justify-between max-w-[1600px] mx-auto w-full">
                {/* Mobile Hamburger & Desktop Navigation Side */}
                <div className="flex items-center gap-4 md:gap-8 flex-1">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-primary transition-all rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <span className="material-symbols-outlined text-[26px]">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <NavLink to="/" className="flex items-center gap-3 group focus:outline-none md:mr-4">
                        <span
                            className="material-symbols-outlined text-primary text-[32px] transition-transform group-hover:scale-110"
                            style={{ fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 200, 'opsz' 48" }}
                        >
                            diamond
                        </span>
                        <h1 className="text-gray-900 dark:text-white text-lg font-display font-bold tracking-tight uppercase hidden lg:block">Hotel Room Monitor</h1>
                    </NavLink>

                    <nav className="hidden md:flex items-center gap-6 ml-4">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `text-[13px] font-bold uppercase tracking-wider transition-all pb-1 border-b-2 ${isActive
                                        ? 'text-primary border-primary'
                                        : 'text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-1 md:gap-2 justify-end">


                    <div className="flex items-center gap-0.5 sm:gap-1 ml-2">
                        <LanguageSwitcher />
                        <NotificationDropdown />

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-all rounded-full hover:bg-gray-100 dark:hover:bg-white/5 group relative"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            <span className="material-symbols-outlined text-[24px]">
                                {theme === 'light' ? 'dark_mode' : 'light_mode'}
                            </span>
                        </button>

                        <ProfileDropdown />
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute top-16 left-0 w-full bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#333] shadow-2xl z-50 md:hidden animate-in slide-in-from-top duration-300">
                        <nav className="flex flex-col p-4 space-y-1">

                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${isActive
                                            ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <span className="material-symbols-outlined">{link.icon}</span>
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </>
            )}
        </header>
    );
};

export default Navbar;

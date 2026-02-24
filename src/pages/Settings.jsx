import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Settings = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('common.settings', { defaultValue: 'Settings' })}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure system-wide preferences and view technical details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appearance & Interface */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-8 shadow-xl transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-primary">palette</span>
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Interface</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Theme Mode</p>
                                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Switch between light and dark</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Regional Language</p>
                                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Select your preferred language</p>
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-8 shadow-xl transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-primary">notifications_active</span>
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Notifications</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Desktop Alerts</p>
                                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Real-time status notifications</p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded cursor-pointer" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Email Daily Digest</p>
                                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Summary of housekeeping activity</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 accent-primary rounded cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-8 shadow-xl transition-colors duration-300 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">System Info</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 content-center">
                        <div className="p-4 bg-gray-50 dark:bg-surface-darker rounded-xl border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Version</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">1.2.0-stable</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-surface-darker rounded-xl border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Environment</p>
                            <p className="text-lg font-black text-primary uppercase">Production</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-surface-darker rounded-xl border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Last Update</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">Oct 24, 2024</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-surface-darker rounded-xl border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Database</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">Firebase RT</p>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/20 p-8 shadow-xl transition-colors duration-300 md:col-span-2 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-display font-bold text-red-600 dark:text-red-500 mb-1">Security & Access</h4>
                        <p className="text-sm text-red-400 dark:text-red-500/60 font-medium">Reset system data or logout from all devices</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20 transition-all text-sm">
                            Log Out
                        </button>
                        <button className="px-6 py-2 bg-red-600 dark:bg-red-500/80 text-white font-bold rounded-lg hover:bg-red-700 dark:hover:bg-red-500 transition-all text-sm shadow-lg shadow-red-600/20">
                            Reset Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

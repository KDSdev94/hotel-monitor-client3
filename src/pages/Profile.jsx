import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AvatarUpload from '../components/AvatarUpload';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
    const { t } = useTranslation();
    const { user, role } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [userData, setUserData] = useState({
        name: user?.displayName || 'Admin Firman',
        email: user?.email || 'admin@hotelmonitor.com',
        role: role?.toUpperCase() || 'ADMINISTRATOR',
        avatar: user?.photoURL || ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(userData.name);

    const handleSave = () => {
        setUserData({ ...userData, name: newName });
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('common.profile', { defaultValue: 'Profile' })}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('profile.manage_account', { defaultValue: 'Manage your personal account settings' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-8 shadow-xl text-center transition-colors duration-300">
                        <div className="mb-6">
                            <AvatarUpload
                                name={userData.name}
                                currentImage={userData.avatar}
                                onUploadSuccess={(url) => setUserData({ ...userData, avatar: url })}
                                size="w-36 h-36"
                            />
                        </div>
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mt-4">{userData.name}</h3>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary mt-1">{userData.role}</p>

                        <div className="mt-8 pt-8 border-t border-gray-50 dark:border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[10px]">Email</span>
                                <span className="text-gray-600 dark:text-gray-300 font-medium truncate ml-4">{userData.email}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[10px]">Account Type</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Premium</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-6 shadow-xl transition-colors duration-300">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">System Preference</h4>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-darker rounded-xl border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">Dark Mode</span>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-8 shadow-xl transition-colors duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-lg font-display font-bold text-gray-900 dark:text-white">Personal Information</h4>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-primary hover:underline text-sm font-bold flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditing(false)} className="text-gray-400 text-sm font-bold">Cancel</button>
                                    <button onClick={handleSave} className="text-primary text-sm font-bold">Save</button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-gray-900 dark:text-white font-bold">{userData.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Phone Number</label>
                                    <p className="text-gray-900 dark:text-white font-bold">+62 812-3456-7890</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Bio</label>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    System Administrator for Hotel Room Monitoring. Responsible for overall operations and staff management.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-8 shadow-xl transition-colors duration-300">
                        <h4 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-6">Security</h4>

                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-darker rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                                        <span className="material-symbols-outlined">key</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Change Password</p>
                                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mt-0.5">Last changed 3 months ago</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-darker rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-500/10 p-2 rounded-lg text-green-500">
                                        <span className="material-symbols-outlined">security</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mt-0.5 text-green-500">Enabled</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

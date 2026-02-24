import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AvatarUpload from '../../components/AvatarUpload';
import { getUserData, updateUserData } from '../../services/authService';
import { useTranslation } from 'react-i18next';

const StaffProfile = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [profileData, setProfileData] = useState({
        name: '',
        fullName: '',
        email: '',
        phone: '',
        department: '',
        role: 'Staff',
        bio: '',
        photoURL: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...profileData });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            if (user?.uid) {
                const data = await getUserData(user.uid);
                if (data) {
                    const mappedData = {
                        name: data.fullName || data.name || '',
                        fullName: data.fullName || data.name || '',
                        email: data.email || user.email || '',
                        phone: data.phone || '',
                        department: data.department || 'Housekeeping',
                        role: data.role || 'Staff',
                        bio: data.bio || '',
                        photoURL: data.photoURL || user.photoURL || '',
                    };
                    setProfileData(mappedData);
                    setEditData(mappedData);
                }
            }
            setLoading(false);
        };
        fetchAllData();
    }, [user?.uid]);

    const handleSave = async () => {
        try {
            if (user?.uid) {
                await updateUserData(user.uid, {
                    fullName: editData.name,
                    phone: editData.phone,
                    bio: editData.bio
                });
                setProfileData({ ...editData });
                setIsEditing(false);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2500);
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

    const handleCancel = () => {
        setEditData({ ...profileData });
        setIsEditing(false);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setShowPasswordForm(false);
        setPasswordData({ current: '', newPass: '', confirm: '' });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
    };

    if (loading) {
        return (
            <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('staff_portal.loading_profile')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-[900px] mx-auto space-y-6">
            {saveSuccess && (
                <div className="fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-lg transition-all duration-300">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span className="text-[13px] font-bold">{t('staff_portal.save_success')}</span>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{t('staff_portal.profile_title')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('staff_portal.profile_desc')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white dark:bg-[#161616] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-8 text-center transition-colors duration-300">
                        <div className="mb-6">
                            <AvatarUpload
                                name={profileData.name}
                                currentImage={profileData.photoURL}
                                onUploadSuccess={(url) => {
                                    setProfileData(prev => ({ ...prev, photoURL: url }));
                                    setEditData(prev => ({ ...prev, photoURL: url }));
                                }}
                                size="w-36 h-36"
                            />
                        </div>

                        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mt-4">{profileData.name}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f4c025] mt-1">{profileData.department}</p>

                        <div className="mt-6 pt-6 border-t border-black/[0.03] dark:border-white/[0.03] space-y-3.5 text-left">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-600">Email</span>
                                <span className="text-[12px] text-gray-600 dark:text-gray-400 font-medium">{profileData.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-600">Role</span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded bg-[#f4c025]/10 text-[#f4c025]">{profileData.role}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-600">Status</span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    {t('staff_portal.active')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#161616] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-4">{t('staff_portal.appearance')}</h3>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[20px] text-gray-500">
                                    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                                </span>
                                <div>
                                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">{t('staff_portal.dark_mode')}</p>
                                    <p className="text-[10px] text-gray-400">{theme === 'dark' ? t('staff_portal.dark_mode_on') : t('staff_portal.dark_mode_off')}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-11 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-[#f4c025]' : 'bg-gray-300 dark:bg-gray-600'}`}
                                aria-label="Toggle dark mode"
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-280 ${theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-5">
                    <div className="bg-white dark:bg-[#161616] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-display font-bold text-gray-900 dark:text-white">{t('staff_portal.personal_info')}</h3>
                            {!isEditing ? (
                                <button
                                    onClick={() => { setEditData({ ...profileData }); setIsEditing(true); }}
                                    className="flex items-center gap-1.5 text-[12px] font-bold text-[#f4c025] hover:text-[#d4a015] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                    {t('staff_portal.edit')}
                                </button>
                            ) : (
                                <div className="flex gap-2.5">
                                    <button onClick={handleCancel} className="text-[12px] font-bold text-gray-400 hover:text-gray-600 transition-colors">{t('staff_portal.cancel')}</button>
                                    <button onClick={handleSave} className="text-[12px] font-bold text-[#f4c025] hover:text-[#d4a015] transition-colors">{t('staff_portal.save')}</button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.full_name')}</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-white font-medium outline-none focus:ring-1 focus:ring-[#f4c025]/50 transition-all"
                                            value={editData.name}
                                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    ) : (
                                        <p className="text-[14px] font-bold text-gray-900 dark:text-white">{profileData.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.phone')}</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            className="w-full bg-gray-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-white font-medium outline-none focus:ring-1 focus:ring-[#f4c025]/50 transition-all"
                                            value={editData.phone}
                                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                                        />
                                    ) : (
                                        <p className="text-[14px] font-bold text-gray-900 dark:text-white">{profileData.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.bio')}</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-gray-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3.5 py-3 text-[13px] text-gray-900 dark:text-white font-medium outline-none focus:ring-1 focus:ring-[#f4c025]/50 resize-none transition-all leading-relaxed"
                                        rows={3}
                                        value={editData.bio}
                                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                    />
                                ) : (
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{profileData.bio}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.department')}</label>
                                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">{profileData.department}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.role')}</label>
                                    <p className="text-[14px] font-bold text-gray-600 dark:text-gray-400">
                                        {profileData.role}
                                        <span className="text-[10px] text-gray-400 dark:text-gray-600 ml-2 font-normal">{t('staff_portal.cannot_be_changed')}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#161616] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-6 md:p-8">
                        <h3 className="text-base font-display font-bold text-gray-900 dark:text-white mb-5">{t('staff_portal.security')}</h3>

                        {showPasswordForm ? (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.current_password')}</label>
                                    <input
                                        type="password"
                                        className="w-full bg-gray-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-white font-medium outline-none focus:ring-1 focus:ring-[#f4c025]/50 transition-all"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                                        aria-required="true"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.new_password')}</label>
                                        <input
                                            type="password"
                                            className="w-full bg-gray-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-white font-medium outline-none focus:ring-1 focus:ring-[#f4c025]/50 transition-all"
                                            value={passwordData.newPass}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPass: e.target.value }))}
                                            aria-required="true"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600 mb-2">{t('staff_portal.confirm_password')}</label>
                                        <input
                                            type="password"
                                            className="w-full bg-gray-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-white font-medium outline-none focus:ring-1 focus:ring-[#f4c025]/50 transition-all"
                                            value={passwordData.confirm}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                                            aria-required="true"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl bg-[#f4c025] text-black text-[13px] font-bold hover:bg-[#d4a015] transition-colors"
                                    >
                                        {t('staff_portal.update_password')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowPasswordForm(false); setPasswordData({ current: '', newPass: '', confirm: '' }); }}
                                        className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 text-[13px] font-bold hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors"
                                    >
                                        {t('staff_portal.cancel')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04] hover:border-[#f4c025]/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/8 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px] text-blue-500">key</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[13px] font-bold text-gray-900 dark:text-white">{t('staff_portal.change_password')}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{t('staff_portal.last_changed')}</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                </button>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/8 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px] text-emerald-500">shield</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[13px] font-bold text-gray-900 dark:text-white">{t('staff_portal.two_factor')}</p>
                                            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">{t('staff_portal.enabled')}</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-[18px] text-emerald-500">verified</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;

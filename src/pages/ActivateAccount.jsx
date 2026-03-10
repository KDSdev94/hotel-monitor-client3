import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import { activateStaffAccount } from '../services/authService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const ActivateAccount = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchInactiveStaff = async () => {
            try {
                const q = query(collection(db, 'staff'), where('isActive', '==', false));
                const querySnapshot = await getDocs(q);
                const staff = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setStaffList(staff);
            } catch (err) {
                console.error(err);
            } finally {
                setFetching(false);
            }
        };
        fetchInactiveStaff();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStaff) {
            setStatus({ type: 'error', message: t('activate.error_select_name', { defaultValue: 'Silakan pilih nama Anda dari daftar.' }) });
            return;
        }

        setStatus({ type: '', message: '' });
        setLoading(true);
        try {
            await activateStaffAccount(selectedStaff, email, password);
            setStatus({ type: 'success', message: t('activate.success_message', { defaultValue: 'Akun berhasil diaktifkan! Mengalihkan...' }) });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus({ type: 'error', message: err.message || t('activate.error_generic', { defaultValue: 'Gagal mengaktifkan akun. Silakan coba lagi.' }) });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={t('activate.title', { defaultValue: 'Aktivasi Akun' })}
            subtitle={t('activate.subtitle', { defaultValue: 'Pilih nama Anda dan atur kredensial masuk Anda.' })}
            imageQuote={t('activate.image_quote', { defaultValue: 'Join our team and redefine luxury service.' })}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {status.message && (
                    <div className={`p-4 border rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-1 ${status.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        {status.message}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="staffName">{t('activate.select_name', { defaultValue: 'Pilih Nama Anda' })}</label>
                    <div className="relative">
                        <select
                            required
                            className="w-full rounded-lg border-slate-300 dark:border-[#685a31] bg-white dark:bg-[#342d18] text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-11 pr-4 transition-colors outline-none cursor-pointer text-sm"
                            id="staffName"
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            disabled={fetching}
                        >
                            <option value="">{fetching ? t('common.loading') : t('activate.select_placeholder', { defaultValue: 'Pilih dari daftar...' })}</option>
                            {staffList.map(s => (
                                <option key={s.id} value={s.id}>{s.fullName || s.name}</option>
                            ))}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#cbbc90]">
                            <span className="material-symbols-outlined text-[20px]">badge</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">{t('common.email')}</label>
                    <div className="relative">
                        <input
                            required
                            className="w-full rounded-lg border-slate-300 dark:border-[#685a31] bg-white dark:bg-[#342d18] text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-11 pr-4 placeholder:text-slate-400 dark:placeholder:text-[#cbbc90]/50 transition-colors text-sm"
                            id="email"
                            placeholder="name@luxuryhotel.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#cbbc90]">
                            <span className="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">{t('common.password')}</label>
                    <div className="relative group">
                        <input
                            required
                            className="w-full rounded-lg border-slate-300 dark:border-[#685a31] bg-white dark:bg-[#342d18] text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-11 pr-11 placeholder:text-slate-400 dark:placeholder:text-[#cbbc90]/50 transition-colors text-sm"
                            id="password"
                            placeholder={t('activate.password_placeholder', { defaultValue: 'Buat kata sandi yang kuat' })}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#cbbc90]">
                            <span className="material-symbols-outlined text-[20px]">lock</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#cbbc90] hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-[#cbbc90]/70 uppercase font-bold tracking-wider">{t('activate.password_hint', { defaultValue: 'Kata sandi minimal 6 karakter.' })}</p>
                </div>

                <button
                    disabled={loading || fetching}
                    className="mt-4 flex w-full items-center justify-center rounded-lg h-12 px-4 bg-primary text-background-dark text-base font-extrabold leading-normal hover:bg-[#e5b21e] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 uppercase tracking-widest"
                    type="submit"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <span>{t('activate.activate_button', { defaultValue: 'AKTIVASI AKUN' })}</span>
                    )}
                </button>

                <div className="text-center mt-4">
                    <NavLink to="/login" className="text-sm font-medium text-slate-600 dark:text-[#cbbc90]">
                        {t('activate.already_member', { defaultValue: 'Sudah punya akun?' })} <span className="text-primary font-bold">{t('common.login')}</span>
                    </NavLink>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ActivateAccount;

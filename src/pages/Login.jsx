import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import { loginUser } from '../services/authService';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { role } = await loginUser(email, password);
            console.log("Logged in with role:", role);

            if (role === 'admin') {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/staff/dashboard', { replace: true });
            }
        } catch (err) {
            setError(t('login.error_invalid_credentials', { defaultValue: 'Email atau password salah. Silakan coba lagi.' }));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={t('common.login')}
            subtitle={t('login.welcome_subtitle', { defaultValue: 'Masukkan detail akun Anda untuk masuk ke sistem monitoring.' })}
            imageUrl="/login.jpeg"
            imageQuote={t('login.image_quote', { defaultValue: 'Experience the Art of Hospitality' })}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-bold animate-pulse">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400" htmlFor="email">{t('common.email')}</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/70 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                        <input
                            required
                            className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-charcoal dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-sans"
                            id="email"
                            placeholder="staff@hotel.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400" htmlFor="password">{t('common.password')}</label>
                        <NavLink to="/forgot-password" size="sm" className="text-xs text-primary hover:text-primary/80 font-bold transition-colors">{t('login.forgot_password', { defaultValue: 'Lupa Password?' })}</NavLink>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/70 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">lock</span>
                        </div>
                        <input
                            required
                            className="block w-full pl-12 pr-12 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-charcoal dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-sans"
                            id="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-charcoal dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                    <button
                        disabled={loading}
                        className="w-full h-14 bg-[#1a1a1a] dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-black font-bold text-sm tracking-widest rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                        type="submit"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="uppercase">{t('common.login')}</span>
                                <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">arrow_forward_ios</span>
                            </>
                        )}
                    </button>
                </div>

                <p className="text-center text-gray-500 dark:text-slate-400 text-[13px] mt-4 font-sans">
                    {t('login.new_staff', { defaultValue: 'Staf baru?' })}
                    <NavLink to="/activate" className="ml-2 font-bold text-primary hover:text-primary/80 transition-colors border-b border-primary/30 hover:border-primary">{t('login.activate_account', { defaultValue: 'Aktivasi Akun' })}</NavLink>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Login;

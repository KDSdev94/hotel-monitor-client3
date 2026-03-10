import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import { resetPassword } from '../services/authService';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setLoading(true);
        try {
            await resetPassword(email);
            setStatus({ type: 'success', message: t('forgot_password.success_message', { defaultValue: 'Instruksi telah dikirim! Silakan periksa kotak masuk email Anda.' }) });
            setEmail('');
        } catch (err) {
            setStatus({ type: 'error', message: t('forgot_password.error_message', { defaultValue: 'Gagal mengirim instruksi. Silakan periksa email Anda.' }) });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={t('forgot_password.title', { defaultValue: 'Reset Password' })}
            subtitle={t('forgot_password.subtitle', { defaultValue: 'Masukkan alamat email yang terdaftar dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.' })}
            imageQuote={t('forgot_password.image_quote', { defaultValue: 'Rediscover Peace of Mind' })}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {status.message && (
                    <div className={`p-4 border rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-1 ${status.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        {status.message}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-charcoal dark:text-slate-200" htmlFor="email">{t('common.email')}</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                        <input
                            required
                            className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-charcoal dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-sans"
                            id="email"
                            placeholder="name@hotel.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2 flex flex-col gap-6">
                    <button
                        disabled={loading}
                        className="w-full h-14 bg-charcoal dark:bg-white hover:bg-charcoal-dark dark:hover:bg-slate-200 text-primary dark:text-charcoal font-bold text-lg tracking-wide rounded-lg transition-all duration-300 shadow-lg shadow-charcoal/10 dark:shadow-none flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                        type="submit"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="uppercase">{t('forgot_password.send_button', { defaultValue: 'KIRIM INSTRUKSI' })}</span>
                                <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">send</span>
                            </>
                        )}
                    </button>
                    <div className="text-center">
                        <NavLink to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-charcoal dark:text-slate-400 dark:hover:text-white transition-colors font-sans text-sm font-medium group/link">
                            <span className="material-symbols-outlined text-[18px] group-hover/link:-translate-x-1 transition-transform">arrow_back</span>
                            {t('forgot_password.back_to_login', { defaultValue: 'Kembali ke Login' })}
                        </NavLink>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPassword;

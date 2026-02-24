import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AuthLayout = ({ children, title, subtitle, imageUrl, imageQuote }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased min-h-screen lg:h-screen w-full flex flex-col lg:flex-row lg:overflow-hidden relative">
            {/* Global Language Switcher - Fixed at top right */}
            <div className="fixed top-4 right-4 lg:top-8 lg:right-8 z-50">
                <LanguageSwitcher />
            </div>

            {/* Left/Top Split: Image Section */}
            <div className="flex w-full lg:w-1/2 h-[30vh] lg:h-full relative bg-charcoal overflow-hidden group shrink-0">
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'})` }}
                />
                <div className="absolute inset-0 bg-charcoal/40 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent"></div>

                <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 w-full h-full text-[#fcfbf8]">
                    <div className="flex items-center gap-2">
                        <span
                            className="material-symbols-outlined text-primary text-3xl lg:text-4xl"
                            style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 200, 'opsz' 48" }}
                        >
                            diamond
                        </span>
                        <span className="text-lg lg:text-xl font-bold tracking-widest uppercase">Hotel Room Monitor</span>
                    </div>
                    <div className="max-w-md hidden lg:block">
                        <h2 className="text-3xl lg:text-5xl font-medium leading-tight mb-6 text-white">
                            {imageQuote || 'Experience the Art of Hospitality'}
                        </h2>
                    </div>
                    <div className="hidden lg:flex items-center gap-4 text-sm font-medium tracking-wide text-white/60">
                        <span>© {new Date().getFullYear()} Hotel Room Monitor.</span>
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a className="hover:text-primary transition-colors" href="#">{t('common.privacy', { defaultValue: 'Privacy' })}</a>
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a className="hover:text-primary transition-colors" href="#">{t('common.terms', { defaultValue: 'Terms' })}</a>
                    </div>
                </div>
            </div>

            {/* Right Split: Form Section */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-background-light dark:bg-background-dark relative lg:overflow-y-auto">
                {/* Decoration line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-30 lg:hidden"></div>

                <div className="w-full max-w-[480px] flex flex-col gap-8 py-4">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl lg:text-5xl font-medium text-charcoal dark:text-white tracking-tight">
                            {title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base lg:text-lg font-sans">
                            {subtitle}
                        </p>
                    </div>

                    {children}

                    <div className="lg:hidden flex flex-col items-center gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
                            <a className="hover:text-primary transition-colors" href="#">{t('common.privacy', { defaultValue: 'Privacy' })}</a>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20"></span>
                            <a className="hover:text-primary transition-colors" href="#">{t('common.terms', { defaultValue: 'Terms' })}</a>
                        </div>
                        <p className="text-[10px] text-slate-300 dark:text-slate-500 font-bold tracking-widest uppercase">
                            © {new Date().getFullYear()} Hotel Room Monitor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;

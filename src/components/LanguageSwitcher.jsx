import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
        { code: 'id', label: 'Indonesia', flag: '🇮🇩', short: 'ID' },
    ];

    const currentLanguage = languages.find(l => l.code === (i18n.language?.split('-')[0] || 'en')) || languages[0];

    const toggleLanguage = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 border border-slate-200 dark:border-white/10 text-charcoal dark:text-white transition-all rounded-full shadow-lg backdrop-blur-xl group"
                title="Change Language"
            >
                <span className="material-symbols-outlined text-[20px] text-primary group-hover:rotate-12 transition-transform">language</span>
                <span className="text-xs font-black tracking-widest">{currentLanguage.short}</span>
                <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 opacity-50 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-44 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">Select Language</span>
                        </div>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => toggleLanguage(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${currentLanguage.code === lang.code
                                    ? 'text-primary bg-primary/5 font-extrabold'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-bold'
                                    }`}
                            >
                                <span className="flex-1 text-left">{lang.label}</span>
                                {currentLanguage.code === lang.code && (
                                    <span className="material-symbols-outlined text-[18px] text-primary font-black">done</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;

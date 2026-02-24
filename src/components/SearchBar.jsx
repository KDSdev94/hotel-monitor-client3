import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SearchBar = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    return (
        <div className={`relative flex items-center transition-all duration-300 ${isExpanded ? 'w-64 md:w-80' : 'w-10 md:w-64'}`}>
            <div
                className={`flex items-center bg-gray-100 dark:bg-surface-dark rounded-full px-3 py-1.5 border transition-all w-full h-10 ${isExpanded || searchTerm
                        ? 'border-primary ring-2 ring-primary/10'
                        : 'border-transparent dark:border-[#444] hover:border-gray-300 dark:hover:border-gray-500 shadow-inner dark:shadow-none'
                    }`}
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-400 hover:text-primary transition-colors flex items-center justify-center h-full"
                >
                    <span className="material-symbols-outlined text-[22px]">search</span>
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsExpanded(true)}
                    onBlur={() => !searchTerm && setIsExpanded(false)}
                    placeholder={t('common.search_placeholder')}
                    className={`bg-transparent border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 w-full ml-2 h-full p-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'
                        } font-bold`}
                />

                {searchTerm && (
                    <button
                        onClick={() => { setSearchTerm(''); setIsExpanded(false); }}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                )}
            </div>

            {/* Suggestion Dropdown */}
            {searchTerm.length > 1 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-[#444] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-gray-50 dark:bg-surface-darker/50">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest">{t('common.search_placeholder').split(' ')[0]} Sugesti</span>
                        <span className="text-[10px] text-primary font-extrabold tracking-tighter">ESC</span>
                    </div>
                    <div className="py-1">
                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors group">
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-[18px]">bed</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-bold">{t('common.room')} <strong>{searchTerm}</strong></span>
                        </button>
                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors group">
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-[18px]">person</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-bold">{t('common.staff')} "<strong>{searchTerm}...</strong>"</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;

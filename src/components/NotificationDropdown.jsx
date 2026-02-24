import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { subscribeToNotifications } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribeToNotifications((data) => {
            setNotifications(data);
        });
        return () => unsubscribe();
    }, []);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAllRead = () => {
        // In this implementation, we just clear the local unread state
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
            >
                <span className="material-symbols-outlined text-[24px]">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-black text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white dark:ring-background-dark shadow-sm">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dark border border-gray-100 dark:border-[#444] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#444] flex justify-between items-center bg-gray-50 dark:bg-surface-darker/50">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('notifications.title')}</h3>
                            <button
                                onClick={markAllRead}
                                className="text-[11px] text-primary hover:underline font-extrabold uppercase tracking-widest"
                            >
                                {t('notifications.mark_all_read')}
                            </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`px-4 py-3 border-b border-gray-50 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${n.unread ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-bold ${n.unread ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}>{n.title}</h4>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase">
                                                {n.time ? formatDistanceToNow(n.time, { addSuffix: true }) : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium">{n.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-20">notifications_off</span>
                                    <p className="text-sm font-bold">{t('notifications.no_notifications')}</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-3 bg-gray-50 dark:bg-surface-darker/50 border-t border-gray-100 dark:border-[#444] text-center">
                            <button className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-primary transition-colors font-extrabold uppercase tracking-widest">
                                View all activity
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;

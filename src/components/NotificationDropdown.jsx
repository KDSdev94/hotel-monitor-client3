import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
    isAdminRole,
    markNotificationAsRead,
    markNotificationsAsRead,
    subscribeToNotifications
} from '../services/notificationService';
import {
    enablePushNotifications,
    getPushNotificationState
} from '../services/pushNotificationService';

const NotificationDropdown = () => {
    const { t } = useTranslation();
    const { user, role } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [pushState, setPushState] = useState({
        supported: false,
        permission: 'default',
        hasVapidKey: false
    });
    const [enablingPush, setEnablingPush] = useState(false);

    useEffect(() => {
        if (!user) return () => { };

        const unsubscribe = subscribeToNotifications(user, role, (data) => {
            setNotifications(data);
        });

        return () => unsubscribe();
    }, [user, role]);

    useEffect(() => {
        let mounted = true;

        const loadPushState = async () => {
            const state = await getPushNotificationState();
            if (mounted) {
                setPushState(state);
            }
        };

        loadPushState();

        return () => {
            mounted = false;
        };
    }, []);

    const unreadCount = notifications.filter((notification) => notification.unread).length;
    const adminView = isAdminRole(role);

    const refreshPushState = async () => {
        const state = await getPushNotificationState();
        setPushState(state);
    };

    const handleEnablePush = async () => {
        if (!user?.uid) return;

        setEnablingPush(true);
        try {
            const result = await enablePushNotifications(user);

            if (result.ok) {
                toast.success('Notifikasi perangkat berhasil diaktifkan.');
            } else if (result.reason === 'missing-vapid-key') {
                toast.error('VAPID key belum diisi, jadi push notification belum bisa aktif.');
            } else if (result.reason === 'permission-denied') {
                toast.error('Izin notifikasi ditolak di browser/perangkat.');
            } else {
                toast.error('Perangkat ini belum mendukung web push untuk aplikasi ini.');
            }
        } catch (error) {
            console.error('Enable push notification failed:', error);
            toast.error('Gagal mengaktifkan notifikasi perangkat.');
        } finally {
            setEnablingPush(false);
            await refreshPushState();
        }
    };

    const markAllRead = async () => {
        try {
            await markNotificationsAsRead(notifications, user?.uid);
            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) => ({ ...notification, unread: false }))
            );
        } catch (error) {
            console.error('Mark all notifications as read failed:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (notification.source === 'notification' && notification.unread) {
            try {
                await markNotificationAsRead(notification.docId, user?.uid);
            } catch (error) {
                console.error('Mark notification as read failed:', error);
            }
        }

        setNotifications((currentNotifications) =>
            currentNotifications.map((item) =>
                item.id === notification.id ? { ...item, unread: false } : item
            )
        );

        setIsOpen(false);

        if (notification.actionUrl) {
            window.location.assign(notification.actionUrl);
        }
    };

    const showPushCta = pushState.supported && pushState.permission !== 'granted';
    const missingPushConfig = pushState.supported && !pushState.hasVapidKey;
    const feedLabel = adminView ? 'Aktivitas admin' : 'Aktivitas personal staff';
    const pushTitle = adminView ? 'Aktifkan notifikasi admin' : 'Aktifkan notifikasi HP';
    const pushDescription = adminView
        ? 'Agar update operasional tampil di browser/perangkat admin ini, izinkan notifikasi perangkat.'
        : 'Agar notif bisa muncul di sistem UI/lock screen, izinkan notifikasi perangkat untuk akun ini.';

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

                        {showPushCta && (
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#333] bg-primary/5">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{pushTitle}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                    {pushDescription}
                                </p>
                                <button
                                    onClick={handleEnablePush}
                                    disabled={enablingPush || missingPushConfig}
                                    className="mt-3 w-full px-3 py-2 rounded-lg bg-primary text-black text-[11px] font-black uppercase tracking-widest disabled:opacity-50"
                                >
                                    {enablingPush ? 'Mengaktifkan...' : pushTitle}
                                </button>
                                <p className="text-[10px] text-gray-400 mt-2">
                                    Di iPhone, web push biasanya perlu dibuka sebagai Home Screen app.
                                </p>
                                {missingPushConfig && (
                                    <p className="text-[10px] text-red-500 mt-2">
                                        VAPID key belum di-set di environment aplikasi.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${notification.unread ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1 gap-3">
                                            <h4 className={`text-sm font-bold ${notification.unread ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase whitespace-nowrap">
                                                {notification.time ? formatDistanceToNow(notification.time, { addSuffix: true }) : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium">
                                            {notification.description}
                                        </p>
                                    </button>
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
                                {feedLabel}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;

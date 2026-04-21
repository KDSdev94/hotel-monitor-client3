import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { attachForegroundPushListener, syncPushNotifications } from '../services/pushNotificationService';

const PushNotificationManager = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.uid) return () => { };

        let unsubscribe = () => { };

        const setupPush = async () => {
            await syncPushNotifications(user);

            unsubscribe = await attachForegroundPushListener((payload) => {
                const title = payload?.notification?.title || payload?.data?.title || 'Notifikasi baru';
                const body = payload?.notification?.body || payload?.data?.body || 'Ada update baru untuk Anda.';

                toast.success(`${title}: ${body}`, {
                    duration: 6000
                });
            });
        };

        setupPush().catch((error) => {
            console.error('Push notification setup failed:', error);
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

    return null;
};

export default PushNotificationManager;

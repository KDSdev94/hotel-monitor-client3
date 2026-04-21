import { deleteField, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { app, db } from './firebase';

const PUSH_TOKEN_COLLECTION = 'pushTokens';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const canUseBrowserNotifications = () =>
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator;

const getMessagingInstance = async () => {
    if (!canUseBrowserNotifications()) return null;

    const supported = await isSupported();
    if (!supported) return null;

    return getMessaging(app);
};

const upsertPushToken = async (token, user) => {
    const tokenRef = doc(db, PUSH_TOKEN_COLLECTION, token);
    const existingToken = await getDoc(tokenRef);

    await setDoc(tokenRef, {
        token,
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.fullName || '',
        platform: navigator.userAgentData?.platform || navigator.platform || 'web',
        userAgent: navigator.userAgent,
        enabled: true,
        createdAt: existingToken.exists() ? existingToken.data().createdAt || serverTimestamp() : serverTimestamp(),
        updatedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, 'users', user.uid), {
        lastPushToken: token,
        pushNotificationsEnabled: true,
        pushPermission: Notification.permission,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

export const getPushNotificationState = async () => {
    const supported = await isSupported().catch(() => false);

    return {
        supported: canUseBrowserNotifications() && supported,
        permission: canUseBrowserNotifications() ? Notification.permission : 'unsupported',
        hasVapidKey: Boolean(VAPID_KEY)
    };
};

export const enablePushNotifications = async (user) => {
    if (!user?.uid) {
        return { ok: false, reason: 'missing-user' };
    }

    if (!canUseBrowserNotifications()) {
        return { ok: false, reason: 'unsupported-browser' };
    }

    if (!VAPID_KEY) {
        return { ok: false, reason: 'missing-vapid-key' };
    }

    const messaging = await getMessagingInstance();
    if (!messaging) {
        return { ok: false, reason: 'unsupported-browser' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        await setDoc(doc(db, 'users', user.uid), {
            pushNotificationsEnabled: false,
            pushPermission: permission,
            lastPushToken: deleteField(),
            updatedAt: serverTimestamp()
        }, { merge: true });

        return { ok: false, reason: 'permission-denied' };
    }

    const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration
    });

    if (!token) {
        return { ok: false, reason: 'token-unavailable' };
    }

    await upsertPushToken(token, user);

    return { ok: true, token };
};

export const syncPushNotifications = async (user) => {
    if (!user?.uid || !canUseBrowserNotifications() || Notification.permission !== 'granted' || !VAPID_KEY) {
        return { ok: false, reason: 'skipped' };
    }

    const messaging = await getMessagingInstance();
    if (!messaging) {
        return { ok: false, reason: 'unsupported-browser' };
    }

    const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration
    });

    if (!token) {
        return { ok: false, reason: 'token-unavailable' };
    }

    await upsertPushToken(token, user);

    return { ok: true, token };
};

export const attachForegroundPushListener = async (callback) => {
    const messaging = await getMessagingInstance();
    if (!messaging) return () => { };

    return onMessage(messaging, callback);
};

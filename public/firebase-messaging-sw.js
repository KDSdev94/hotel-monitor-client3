/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyBIPSMWU5hyuK97_rz6-3EEerZwbqmFsYE',
    authDomain: 'housekeeping-sytem.firebaseapp.com',
    projectId: 'housekeeping-sytem',
    storageBucket: 'housekeeping-sytem.firebasestorage.app',
    messagingSenderId: '85757089580',
    appId: '1:85757089580:web:7e79a16672f3e25fe13e89',
    measurementId: 'G-45G6B6BBL6'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload?.notification?.title || payload?.data?.title || 'Notifikasi baru';
    const notificationOptions = {
        body: payload?.notification?.body || payload?.data?.body || 'Ada update baru untuk Anda.',
        icon: '/vite.svg',
        badge: '/vite.svg',
        data: {
            link: payload?.fcmOptions?.link || payload?.data?.link || '/staff/tasks'
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification?.data?.link || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }

            return null;
        })
    );
});

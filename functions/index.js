/* eslint-env node */
const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

exports.sendStaffPushNotification = onDocumentCreated('notifications/{notificationId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const notification = snapshot.data();
    if (!notification || notification.audience !== 'user' || !notification.recipientUid) {
        return;
    }

    const pushTokensSnapshot = await db
        .collection('pushTokens')
        .where('uid', '==', notification.recipientUid)
        .where('enabled', '==', true)
        .get();

    if (pushTokensSnapshot.empty) {
        logger.info('No push tokens found for recipient', { uid: notification.recipientUid });
        return;
    }

    const tokens = pushTokensSnapshot.docs.map((docSnap) => docSnap.id);

    const message = {
        notification: {
            title: notification.title || 'Notifikasi baru',
            body: notification.description || 'Ada update baru untuk Anda.'
        },
        data: {
            notificationId: snapshot.id,
            title: notification.title || 'Notifikasi baru',
            body: notification.description || 'Ada update baru untuk Anda.',
            link: notification.actionUrl || '/staff/tasks'
        },
        webpush: {
            notification: {
                title: notification.title || 'Notifikasi baru',
                body: notification.description || 'Ada update baru untuk Anda.',
                icon: '/vite.svg',
                badge: '/vite.svg'
            },
            fcmOptions: {
                link: notification.actionUrl || '/staff/tasks'
            }
        },
        tokens
    };

    const response = await messaging.sendEachForMulticast(message);

    const invalidTokens = [];
    response.responses.forEach((result, index) => {
        if (!result.success) {
            const errorCode = result.error?.code || 'unknown';
            logger.error('Failed to send push notification', {
                token: tokens[index],
                errorCode
            });

            if (
                errorCode === 'messaging/invalid-registration-token' ||
                errorCode === 'messaging/registration-token-not-registered'
            ) {
                invalidTokens.push(tokens[index]);
            }
        }
    });

    if (invalidTokens.length > 0) {
        await Promise.all(
            invalidTokens.map((token) => db.collection('pushTokens').doc(token).delete())
        );
    }

    logger.info('Push notification processed', {
        notificationId: snapshot.id,
        successCount: response.successCount,
        failureCount: response.failureCount
    });
});

import {
    addDoc,
    collection,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { getTaskStatusLabel, getTaskTypeLabel } from '../utils/taskHelpers';

const ADMIN_ROLES = ['admin', 'front office', 'fo', 'receptionist', 'management', 'manager', 'super admin'];

const normalizeRole = (role) => (role || '').toString().trim().toLowerCase();

export const isAdminRole = (role) => ADMIN_ROLES.includes(normalizeRole(role));

const toDateValue = (value) => {
    if (!value) return null;
    if (typeof value?.toDate === 'function') return value.toDate();
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const mapNotificationDoc = (docSnap, userUid) => {
    const data = docSnap.data();
    return {
        id: `notification-${docSnap.id}`,
        docId: docSnap.id,
        source: 'notification',
        title: data.title || 'Notifikasi baru',
        description: data.description || '',
        time: toDateValue(data.createdAt) || toDateValue(data.updatedAt),
        type: data.type || 'info',
        unread: !data.readBy?.[userUid],
        actionUrl: data.actionUrl || null,
        raw: {
            id: docSnap.id,
            ...data
        }
    };
};

const mapIssueDoc = (docSnap) => {
    const data = docSnap.data();
    return {
        id: `issue-${docSnap.id}`,
        docId: docSnap.id,
        source: 'issue',
        title: `Laporan: ${data.title || 'Masalah'}`,
        description: `Kamar ${data.roomNumber}: ${data.description || 'Ada laporan baru.'}`,
        time: toDateValue(data.createdAt) || toDateValue(data.updatedAt),
        type: 'error',
        unread: true,
        actionUrl: null,
        raw: {
            id: docSnap.id,
            ...data
        }
    };
};

export const createNotification = async (payload) => {
    const notificationPayload = {
        audience: payload.audience || 'user',
        recipientUid: payload.recipientUid || null,
        recipientStaffId: payload.recipientStaffId || null,
        senderUid: payload.senderUid || null,
        senderName: payload.senderName || 'Admin',
        senderRole: payload.senderRole || null,
        category: payload.category || 'general',
        title: payload.title || 'Notifikasi baru',
        description: payload.description || '',
        type: payload.type || 'info',
        roomId: payload.roomId || null,
        roomNumber: payload.roomNumber || null,
        taskId: payload.taskId || null,
        taskType: payload.taskType || null,
        taskStatus: payload.taskStatus || null,
        actionUrl: payload.actionUrl || null,
        readBy: payload.readBy || {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    return addDoc(collection(db, 'notifications'), notificationPayload);
};

export const createStaffAssignmentNotification = async ({
    recipientUid,
    recipientStaffId,
    roomId,
    roomNumber,
    taskId,
    taskType,
    sender
}) => {
    if (!recipientUid) return null;

    const senderName = sender?.name || sender?.displayName || 'Admin';

    return createNotification({
        audience: 'user',
        recipientUid,
        recipientStaffId,
        senderUid: sender?.uid || null,
        senderName,
        senderRole: sender?.role || 'admin',
        category: 'task_assigned',
        title: `${senderName} menunjuk Anda`,
        description: `${senderName} menugaskan ${getTaskTypeLabel(taskType)} untuk kamar ${roomNumber}.`,
        type: 'warning',
        roomId,
        roomNumber,
        taskId,
        taskType,
        taskStatus: 'pending',
        actionUrl: '/staff/tasks'
    });
};

export const createAdminAssignmentNotification = async ({
    roomId,
    roomNumber,
    taskId,
    taskType,
    assignedStaff,
    sender
}) => {
    return createNotification({
        audience: 'admins',
        senderUid: sender?.uid || null,
        senderName: sender?.name || sender?.displayName || 'Admin',
        senderRole: sender?.role || 'admin',
        category: 'task_assigned_by_admin',
        title: `Tugas dikirim ke ${assignedStaff?.name || 'staff'}`,
        description: `${sender?.name || sender?.displayName || 'Admin'} menugaskan ${getTaskTypeLabel(taskType)} untuk kamar ${roomNumber} ke ${assignedStaff?.name || 'staff'}.`,
        type: 'info',
        roomId,
        roomNumber,
        taskId,
        taskType,
        taskStatus: 'pending',
        actionUrl: '/rooms'
    });
};

export const createAdminTaskStatusNotification = async ({ task, status, actor }) => {
    const actorName = actor?.name || actor?.displayName || task?.staffName || 'Staff';
    const roomNumber = task?.roomNumber || '-';
    const taskLabel = getTaskTypeLabel(task?.type);
    const statusLabel = getTaskStatusLabel(status);

    let title = `Update tugas kamar ${roomNumber}`;
    let description = `${actorName} memperbarui ${taskLabel} untuk kamar ${roomNumber}.`;
    let type = 'info';

    if (status === 'in_progress') {
        title = `Kamar ${roomNumber} mulai dikerjakan`;
        description = `${actorName} mulai mengerjakan ${taskLabel}.`;
    }

    if (status === 'completed') {
        title = `Kamar ${roomNumber} selesai dikerjakan`;
        description = `${actorName} menandai ${taskLabel} sebagai ${statusLabel}.`;
        type = 'success';
    }

    return createNotification({
        audience: 'admins',
        senderUid: actor?.uid || null,
        senderName: actorName,
        senderRole: actor?.role || 'staff',
        category: 'task_status_changed',
        title,
        description,
        type,
        roomId: task?.roomId || null,
        roomNumber,
        taskId: task?.id || null,
        taskType: task?.type || null,
        taskStatus: status,
        actionUrl: '/dashboard'
    });
};

export const subscribeToNotifications = (user, role, callback) => {
    if (!user?.uid) return () => { };

    const userUid = user.uid;
    const admin = isAdminRole(role);
    const unsubscribers = [];
    let notificationEntries = [];
    let issueEntries = [];

    const emit = () => {
        const combined = [...notificationEntries, ...issueEntries]
            .filter((item) => item.time)
            .sort((a, b) => (b.time?.getTime() || 0) - (a.time?.getTime() || 0))
            .slice(0, 20);

        callback(combined);
    };

    const notificationQuery = admin
        ? query(
            collection(db, 'notifications'),
            where('audience', '==', 'admins'),
            orderBy('createdAt', 'desc'),
            limit(20)
        )
        : query(
            collection(db, 'notifications'),
            where('recipientUid', '==', userUid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

    unsubscribers.push(onSnapshot(notificationQuery, (snapshot) => {
        notificationEntries = snapshot.docs.map((docSnap) => mapNotificationDoc(docSnap, userUid));
        emit();
    }, (error) => {
        console.error('Notif Error (Notifications):', error);
    }));

    const issuesQuery = admin
        ? query(collection(db, 'issues'), orderBy('createdAt', 'desc'), limit(10))
        : query(collection(db, 'issues'), where('reportedBy', '==', userUid), limit(10));

    unsubscribers.push(onSnapshot(issuesQuery, (snapshot) => {
        issueEntries = snapshot.docs.map((docSnap) => mapIssueDoc(docSnap));
        emit();
    }, (error) => {
        console.error('Notif Error (Issues):', error);
    }));

    return () => {
        unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
};

export const markNotificationsAsRead = async (notifications, userUid) => {
    if (!userUid || !Array.isArray(notifications) || notifications.length === 0) return;

    const targetNotifications = notifications.filter(
        (notification) => notification.source === 'notification' && notification.docId && notification.unread
    );

    if (targetNotifications.length === 0) return;

    const batch = writeBatch(db);

    targetNotifications.forEach((notification) => {
        batch.update(doc(db, 'notifications', notification.docId), {
            [`readBy.${userUid}`]: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    });

    await batch.commit();
};

export const markNotificationAsRead = async (notificationId, userUid) => {
    if (!notificationId || !userUid) return;

    await updateDoc(doc(db, 'notifications', notificationId), {
        [`readBy.${userUid}`]: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

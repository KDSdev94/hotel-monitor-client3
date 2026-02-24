import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export const subscribeToNotifications = (callback) => {
    // We can combine multiple collections into a notification feed
    // For now, let's track issues and tasks as notifications
    const qIssues = query(collection(db, 'issues'), orderBy('createdAt', 'desc'), limit(10));
    const qTasks = query(collection(db, 'tasks'), orderBy('updatedAt', 'desc'), limit(10));

    let issues = [];
    let tasks = [];

    const combineAndNotify = () => {
        const notifications = [
            ...issues.map(issue => ({
                id: `issue-${issue.id}`,
                title: `Issue: ${issue.title || 'Maintenance'}`,
                description: `Room ${issue.roomNumber}: ${issue.description}`,
                time: issue.createdAt?.toDate(),
                type: 'error',
                unread: true, // In a real app, track this per user
                raw: issue
            })),
            ...tasks.filter(t => t.status === 'completed').map(task => ({
                id: `task-${task.id}`,
                title: `Room ${task.roomNumber} Ready`,
                description: `${task.type} finished by staff`,
                time: task.updatedAt?.toDate(),
                type: 'success',
                unread: true,
                raw: task
            }))
        ].sort((a, b) => (b.time?.getTime() || 0) - (a.time?.getTime() || 0));

        callback(notifications.slice(0, 10));
    };

    const unsubIssues = onSnapshot(qIssues, (snap) => {
        issues = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        combineAndNotify();
    });

    const unsubTasks = onSnapshot(qTasks, (snap) => {
        tasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        combineAndNotify();
    });

    return () => {
        unsubIssues();
        unsubTasks();
    };
};

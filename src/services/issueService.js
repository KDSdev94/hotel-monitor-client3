import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Melaporkan issue baru
export const reportIssue = async (issueData) => {
    return await addDoc(collection(db, 'issues'), {
        ...issueData,
        status: 'pending',
        createdAt: serverTimestamp()
    });
};

// Subscribe ke issues yang dilaporkan staff tertentu
export const subscribeToStaffIssues = (staffUid, callback) => {
    // Hapus orderBy dari query Firestore
    const q = query(
        collection(db, 'issues'),
        where('reportedBy', '==', staffUid)
    );

    return onSnapshot(q, (snapshot) => {
        const issues = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sorting di client side
        const sortedIssues = issues.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        callback(sortedIssues);
    }, (error) => {
        console.error("Issue Subscription Error:", error);
    });
};

export const subscribeToAllIssues = (callback) => {
    const q = query(collection(db, 'issues'));
    return onSnapshot(q, (snapshot) => {
        const issues = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(issues);
    }, (error) => {
        console.error("All Issues Subscription Error:", error);
    });
};

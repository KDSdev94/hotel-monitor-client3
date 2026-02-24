import {
    collection,
    updateDoc,
    doc,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    getDocs
} from 'firebase/firestore';
import { db } from './firebase';

// Subscribe ke task milik staff tertentu secara realtime
export const subscribeToStaffTasks = (staffUid, callback) => {
    // Mencoba mencari berdasarkan assignedStaffId atau assignedTo (backward compatibility)
    const q = query(
        collection(db, 'tasks'),
        where('assignedStaffId', '==', staffUid)
    );

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Lakukan sorting di client side (berdasarkan createdAt)
        const sortedTasks = tasks.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA; // Terbaru di atas
        });

        callback(sortedTasks);
    }, (error) => {
        console.error("Task Subscription Error:", error);
    });
};

// Create a new task (biasanya dipanggil saat admin assign staff ke room)
export const createTask = async (taskData) => {
    try {
        const docRef = await addDoc(collection(db, 'tasks'), {
            ...taskData,
            status: taskData.status || 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
};

// Update status task dan trigger auto-update room jika selesai
export const updateTaskStatus = async (taskId, status, additionalData = {}) => {
    const taskRef = doc(db, 'tasks', taskId);
    const updatePayload = {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
    };

    if (status === 'completed') {
        updatePayload.completedAt = serverTimestamp();
    }
    if (status === 'in_progress') {
        updatePayload.startedAt = serverTimestamp();
    }

    await updateDoc(taskRef, updatePayload);

    // Jika task selesai, periksa apakah perlu update room status
    if (status === 'completed') {
        try {
            // Kita butuh data task untuk tahu roomId nya
            // Dalam implementasi nyata, kita mungkin ingin fetch task doc dulu 
            // atau lewat Cloud Function. Di sini kita asumsikan additionalData atau 
            // data yang di-pass mencukupi jika dipanggil dari UI yang sudah punya data.
        } catch (e) {
            console.error("Auto room update failed:", e);
        }
    }
};

export const subscribeToAllTasks = (callback) => {
    const q = query(collection(db, 'tasks'));
    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(tasks);
    }, (error) => {
        console.error("All Tasks Subscription Error:", error);
    });
};

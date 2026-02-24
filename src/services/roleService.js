import {
    collection,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'roles';

export const subscribeToRoles = (callback) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const roles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(roles);
    }, (error) => {
        console.error("Error subscribing to roles:", error);
        callback([]);
    });
};

export const addRole = async (roleName) => {
    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            name: roleName,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding role:", error);
        throw error;
    }
};

export const updateRole = async (roleId, roleName) => {
    try {
        const roleRef = doc(db, COLLECTION_NAME, roleId);
        await updateDoc(roleRef, {
            name: roleName,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating role:", error);
        throw error;
    }
};

export const deleteRole = async (roleId) => {
    try {
        const roleRef = doc(db, COLLECTION_NAME, roleId);
        await deleteDoc(roleRef);
    } catch (error) {
        console.error("Error deleting role:", error);
        throw error;
    }
};

// Fungsi helper untuk inisialisasi default roles jika kosong
export const initializeDefaultRoles = async (currentRoles) => {
    if (currentRoles.length === 0) {
        const defaults = ['Housekeeping', 'Maintenance', 'Receptionist', 'Management'];
        for (const role of defaults) {
            await addRole(role);
        }
    }
};

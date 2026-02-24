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

const COLLECTION_NAME = 'roomTypes';

export const subscribeToRoomTypes = (callback) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const types = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(types);
    }, (error) => {
        console.error("Error subscribing to room types:", error);
        callback([]);
    });
};

export const addRoomType = async (typeName) => {
    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            name: typeName,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding room type:", error);
        throw error;
    }
};

export const updateRoomType = async (typeId, typeName) => {
    try {
        const typeRef = doc(db, COLLECTION_NAME, typeId);
        await updateDoc(typeRef, {
            name: typeName,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating room type:", error);
        throw error;
    }
};

export const deleteRoomType = async (typeId) => {
    try {
        const typeRef = doc(db, COLLECTION_NAME, typeId);
        await deleteDoc(typeRef);
    } catch (error) {
        console.error("Error deleting room type:", error);
        throw error;
    }
};

export const initializeDefaultRoomTypes = async (currentTypes) => {
    if (currentTypes.length === 0) {
        const defaults = ['Standard', 'Deluxe', 'Suite', 'King Suite'];
        for (const type of defaults) {
            await addRoomType(type);
        }
    }
};

import { collection, onSnapshot, query, updateDoc, doc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const subscribeToRooms = (callback) => {
    const q = query(collection(db, "rooms"));
    return onSnapshot(q, (snapshot) => {
        const rooms = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(rooms);
    }, (error) => {
        console.error("Firestore Subscribe Error:", error);
        callback([]);
    });
};

export const addRoom = async (roomData) => {
    try {
        const docRef = await addDoc(collection(db, "rooms"), {
            ...roomData,
            updatedAt: new Date().toISOString()
        });
        return docRef;
    } catch (error) {
        console.error("Error adding room:", error);
        throw error;
    }
};

export const updateRoom = async (roomId, roomData) => {
    try {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
            ...roomData,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating room:", error);
        throw error;
    }
};

export const deleteRoom = async (roomId) => {
    try {
        const roomRef = doc(db, "rooms", roomId);
        await deleteDoc(roomRef);
    } catch (error) {
        console.error("Error deleting room:", error);
        throw error;
    }
};

export const updateRoomStatus = async (roomId, status, updatedBy = 'system') => {
    try {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
            status,
            lastUpdatedBy: updatedBy,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating room status:", error);
        throw error;
    }
};

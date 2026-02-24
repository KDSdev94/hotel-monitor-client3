import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const subscribeToStaff = (callback) => {
    const q = query(collection(db, "staff"));
    return onSnapshot(q, (snapshot) => {
        const staff = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(staff);
    }, (error) => {
        console.error("Firestore Subscribe Error:", error);
        callback([]);
    });
};

export const addStaff = async (staffData) => {
    try {
        await addDoc(collection(db, "staff"), {
            ...staffData,
            isActive: staffData.isActive || false,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error adding staff:", error);
        throw error;
    }
};

export const updateStaff = async (staffId, staffData) => {
    try {
        const staffRef = doc(db, "staff", staffId);
        await updateDoc(staffRef, {
            ...staffData,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating staff:", error);
        throw error;
    }
};

export const deleteStaff = async (staffId) => {
    try {
        const staffRef = doc(db, "staff", staffId);
        await deleteDoc(staffRef);
    } catch (error) {
        console.error("Error deleting staff:", error);
        throw error;
    }
};

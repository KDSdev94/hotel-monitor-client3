import { collection, onSnapshot, query, addDoc, updateDoc, doc, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

export const subscribeToRecentBookings = (callback) => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(bookings);
    });
};

export const createBooking = async (bookingData) => {
    try {
        await addDoc(collection(db, "bookings"), {
            ...bookingData,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

export const updateBookingStatus = async (bookingId, status) => {
    try {
        const bookingRef = doc(db, "bookings", bookingId);
        await updateDoc(bookingRef, {
            status,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating booking:", error);
        throw error;
    }
};

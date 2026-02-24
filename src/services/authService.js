import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
        return { user, role: userDoc.data().role };
    }
    return { user, role: 'staff' }; // Default fallback
};

export const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
};

export const activateStaffAccount = async (staffId, email, password) => {
    // 1. Create the auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Fetch skeleton data from staff record
    const staffDoc = await getDoc(doc(db, 'staff', staffId));
    if (!staffDoc.exists()) throw new Error('Staff record not found');

    const staffData = staffDoc.data();

    // 3. Create user profile in 'users' collection
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        fullName: staffData.fullName || staffData.name,
        role: staffData.role || 'staff',
        department: staffData.department || '',
        photoURL: staffData.avatar || '',
        createdAt: new Date().toISOString()
    });

    // 4. Link staff record to user uid and mark as active
    await updateDoc(doc(db, 'staff', staffId), {
        uid: user.uid,
        email: email,
        isActive: true
    });

    return user;
};

export const getUserData = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) return userDoc.data();
    return null;
};

export const updateUserData = async (uid, data) => {
    await updateDoc(doc(db, 'users', uid), data);
};

export const logoutUser = async () => {
    await signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : { role: 'staff' };
            // Merge Firebase Auth user with Firestore data
            const enrichedUser = {
                ...user,
                displayName: userData.fullName || userData.name || user.displayName,
                photoURL: userData.photoURL || user.photoURL,
                ...userData
            };
            callback(enrichedUser, userData.role || 'staff');
        } else {
            callback(null, null);
        }
    });
};

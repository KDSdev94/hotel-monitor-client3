import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges, logoutUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthContext: Initiating auth listener...");
        const unsubscribe = subscribeToAuthChanges((authUser, userRole) => {
            console.log("AuthContext: Auth state changed", { authUser: authUser?.email, userRole });
            setUser(authUser);
            setRole(userRole);
            setLoading(false);
        });

        // Safety timeout: jika 10 detik tidak ada respon dari Firebase, stop loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 10000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const logout = async () => {
        setLoading(true);
        try {
            await logoutUser();
            setUser(null);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, logout }}>
            {!loading ? children : (
                <div className="h-screen w-full flex items-center justify-center bg-[#f6f5f0] dark:bg-[#0e0e0e]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-[3px] border-[#f4c025] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Authenticating...</p>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ADMIN_ROLES = ['admin', 'Admin', 'Front Office', 'FO', 'Receptionist', 'Management'];
export const STAFF_ROLES = ['staff', 'Housekeeping', 'Maintenance'];

export const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export const RoleRoute = ({ allowedRoles }) => {
    const { role, loading, user } = useAuth();

    if (loading) return null;

    // Jika user ada tapi role tidak sesuai dengan allowedRoles
    const isStaff = STAFF_ROLES.includes(role);
    const isAdmin = ADMIN_ROLES.includes(role);
    const isAllowed = allowedRoles.includes(role);

    if (user && !isAllowed) {
        if (isAdmin) {
            return <Navigate to="/dashboard" replace />;
        }
        if (isStaff) {
            return <Navigate to="/staff/dashboard" replace />;
        }
        // Fallback or explicit access denied
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StaffLayout from '../layouts/StaffLayout';
import Dashboard from '../pages/Dashboard';
import Rooms from '../pages/Rooms';
import Staff from '../pages/Staff';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ActivateAccount from '../pages/ActivateAccount';
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffRooms from '../pages/staff/StaffRooms';
import StaffTasks from '../pages/staff/StaffTasks';
import StaffIssues from '../pages/staff/StaffIssues';
import StaffProfile from '../pages/staff/StaffProfile';
import { ProtectedRoute, RoleRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Komponen penengah untuk redirect path root (/)
const HomeRedirect = () => {
    const { role, loading } = useAuth();
    if (loading) return null;
    return role === 'admin' ? <Navigate to="/dashboard" replace /> : <Navigate to="/staff/dashboard" replace />;
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/activate" element={<ActivateAccount />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    {/* Root path logic */}
                    <Route path="/" element={<HomeRedirect />} />

                    {/* Admin Routes with MainLayout */}
                    <Route element={<RoleRoute allowedRoles={['admin']} />}>
                        <Route element={<MainLayout />}>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="rooms" element={<Rooms />} />
                            <Route path="manage-staff" element={<Staff />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Route>

                    {/* Staff Routes with StaffLayout */}
                    <Route element={<RoleRoute allowedRoles={['staff', 'Housekeeping', 'Receptionist', 'Maintenance']} />}>
                        <Route path="staff" element={<StaffLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<StaffDashboard />} />
                            <Route path="rooms" element={<StaffRooms />} />
                            <Route path="tasks" element={<StaffTasks />} />
                            <Route path="issues" element={<StaffIssues />} />
                            <Route path="profile" element={<StaffProfile />} />
                        </Route>
                    </Route>
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;

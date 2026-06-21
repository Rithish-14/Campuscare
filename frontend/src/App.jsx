import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateComplaint from './pages/CreateComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import ReportsPage from './pages/ReportsPage';
import AdminUsers from './pages/AdminUsers';
import AdminComplaints from './pages/AdminComplaints';

// Smart dashboard routing depending on user role
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'STUDENT':
      return <StudentDashboard />;
    case 'STAFF':
      return <StaffDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Route wrapper that enforces a specific role
const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Workspace Dashboard Routes */}
            <Route path="/" element={<DashboardLayout />}>
              {/* Default landing redirects to dashboard router */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRouter />} />

              {/* Student Only Routes */}
              <Route 
                path="complaints/new" 
                element={
                  <RoleGuard allowedRoles={['STUDENT']}>
                    <CreateComplaint />
                  </RoleGuard>
                } 
              />

              {/* Shared Complaint Details Router (authorized check inside component) */}
              <Route path="complaints/:id" element={<ComplaintDetails />} />

              {/* Admin Only Routes */}
              <Route 
                path="admin/complaints" 
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminComplaints />
                  </RoleGuard>
                } 
              />
              <Route 
                path="admin/users" 
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminUsers />
                  </RoleGuard>
                } 
              />
              <Route 
                path="admin/reports" 
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <ReportsPage />
                  </RoleGuard>
                } 
              />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

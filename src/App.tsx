import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import NoticeDetails from './components/Notices/NoticeDetails';
import EditNotice from './components/Notices/EditNotice';
import PropertyDetails from './components/Properties/PropertyDetails';
import Settings from './components/Admin/Settings';
import AddMember from './components/Admin/AddMember';
import AddPayment from './components/Admin/AddPayment';
import GuestDetails from './components/Guests/GuestDetails';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import MemberDashboard from './components/Dashboard/MemberDashboard';
import GuestDashboard from './components/Dashboard/GuestDashboard';
import NoticeBoard from './components/Notices/NoticeBoard';
import AddNotice from './components/Notices/AddNotice';
import AddGuest from './components/Guests/AddGuest';
import MyGuests from './components/Guests/MyGuests';
import ReportComplaint from './components/Complaints/ReportComplaint';
import MyComplaints from './components/Complaints/MyComplaints';
import ComplaintDetails from './components/Complaints/ComplaintDetails';
import AllComplaints from './components/Admin/AllComplaints';
import MemberDirectory from './components/Admin/MemberDirectory';
import GuestApprovals from './components/Admin/GuestApprovals';
import PropertyManagement from './components/Properties/PropertyManagement';
import PaymentDashboard from './components/Payments/PaymentDashboard';
import Profile from './components/Profile/Profile';

// Configure axios defaults
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:5000';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'member':
      return <MemberDashboard />;
    case 'guest':
      return <GuestDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Notice routes */}
                <Route
                  path="/notices"
                  element={
                    <ProtectedRoute>
                      <NoticeBoard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-notice"
                  element={
                    <ProtectedRoute roles={['admin', 'member']}>
                      <AddNotice />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notices/:id"
                  element={
                    <ProtectedRoute>
                      <NoticeDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-notice/:id"
                  element={
                    <ProtectedRoute roles={['admin', 'member']}>
                      <EditNotice />
                    </ProtectedRoute>
                  }
                />

                {/* Guest routes */}
                <Route
                  path="/add-guest"
                  element={
                    <ProtectedRoute roles={['member']}>
                      <AddGuest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-guests"
                  element={
                    <ProtectedRoute roles={['member']}>
                      <MyGuests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/guests/:id"
                  element={
                    <ProtectedRoute roles={['member']}>
                      <GuestDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/guest-approvals"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <GuestApprovals />
                    </ProtectedRoute>
                  }
                />

                {/* Complaint routes */}
                <Route
                  path="/report-complaint"
                  element={
                    <ProtectedRoute roles={['member', 'guest']}>
                      <ReportComplaint />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-complaints"
                  element={
                    <ProtectedRoute roles={['member']}>
                      <MyComplaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/all-complaints"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AllComplaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complaints/:id"
                  element={
                    <ProtectedRoute>
                      <ComplaintDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/members"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <MemberDirectory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-member"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AddMember />
                    </ProtectedRoute>
                  }
                />

                {/* Property routes */}
                <Route
                  path="/properties"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <PropertyManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/properties/:id"
                  element={
                    <ProtectedRoute>
                      <PropertyDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Payment routes */}
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <PaymentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-payment"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AddPayment />
                    </ProtectedRoute>
                  }
                />

                {/* Settings route */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Profile route */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
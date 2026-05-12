import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import RequestRide from './pages/RequestRide';
import RiderLogin from './pages/RiderLogin';
import RiderDashboard from './pages/RiderDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';


// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role) {
    // Admins and superusers can access admin pages
    if (role === 'admin' && (user.user_type === 'admin' || user.is_superuser)) {
        return children;
    }
    // Riders and drivers must match their specific role
    if (user.user_type !== role) {
        return <Navigate to="/" />;
    }
  }

  
  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navigation />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<RiderLogin />} />
          <Route path="/register" element={<RiderLogin isRegister={true} />} />
          <Route path="/request" element={<RequestRide />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <RiderDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver-dashboard" 
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Driver routes could be added here */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </main>
      
      <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <span className="font-bold text-lg text-white">BodaConnect</span>
              </div>
              <p className="text-sm text-slate-400">Fast, Reliable Boda Rides in Dodoma.</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} BodaConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

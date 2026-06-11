import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
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
  const [mqttMessage, setMqttMessage] = useState(null);

  useEffect(() => {
    // Only connect to MQTT if user is a driver (or for demonstration, anyone)
    // Connecting to the MQTT broker over WebSockets
    const client = mqtt.connect('ws://localhost:9002');

    client.on('connect', () => {
      console.log('Connected to MQTT Broker via WebSockets');
      client.subscribe('ride/requests', (err) => {
        if (!err) {
          console.log('Successfully subscribed to ride/requests topic');
        }
      });
    });

    client.on('message', (topic, message) => {
      if (topic === 'ride/requests') {
        const payload = JSON.parse(message.toString());
        console.log('New Ride Request received via MQTT:', payload);
        setMqttMessage(payload);
        
        // Auto hide notification after 10 seconds
        setTimeout(() => setMqttMessage(null), 10000);
      }
    });

    return () => {
      if (client) client.end();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {mqttMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white p-4 rounded-lg shadow-xl border border-emerald-500 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <div>
              <h4 className="font-bold text-lg">New Ride Request!</h4>
              <p className="text-sm opacity-90">Pickup: {mqttMessage.pickup}</p>
              <p className="text-sm opacity-90">Dest: {mqttMessage.destination}</p>
            </div>
            <button onClick={() => setMqttMessage(null)} className="ml-4 text-white/70 hover:text-white">✕</button>
          </div>
        </div>
      )}
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

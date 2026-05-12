import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

// Simple Dashboards for now
const RiderDashboard = () => (
    <div className="container">
        <h2>Rider Dashboard</h2>
        <p>Welcome to your rider dashboard. You can request rides here.</p>
    </div>
);

const DriverDashboard = () => (
    <div className="container">
        <h2>Driver Dashboard</h2>
        <p>Welcome to your driver dashboard. You can see nearby ride requests here.</p>
    </div>
);

const Header = () => {
    const { user, logout } = useAuth();
    return (
        <header className="header">
            <div className="container">
                <Link to="/" className="logo" style={{ textDecoration: 'none' }}><h1>🏍️ BodaBoda</h1></Link>
                <nav className="nav">
                    {user ? (
                        <>
                            <Link to={user.user_type === 'driver' ? '/driver-dashboard' : '/rider-dashboard'} className="btn btn-secondary">Dashboard</Link>
                            <button onClick={() => logout()} className="btn btn-outline">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (!user) return <Navigate to="/login" />;
    if (role && user.user_type !== role) return <Navigate to="/" />;
    
    return children;
};

const Home = () => {
    const { user } = useAuth();
    return (
        <main className="main">
            <div className="container">
                <section className="hero">
                    <h2>Fast & Reliable Motorcycle Rides</h2>
                    <p>Connect with verified drivers for quick transportation across Tanzania</p>
                    <div className="hero-buttons">
                        {!user && <Link to="/register" className="btn btn-primary btn-large">Get Started</Link>}
                        {user && <Link to={user.user_type === 'driver' ? '/driver-dashboard' : '/rider-dashboard'} className="btn btn-primary btn-large">Go to Dashboard</Link>}
                    </div>
                </section>
            </div>
        </main>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route 
                        path="/rider-dashboard" 
                        element={
                            <ProtectedRoute role="rider">
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
                </Routes>
                <footer className="footer">
                    <div className="container">
                        <p>&copy; 2026 BodaBoda. All rights reserved.</p>
                    </div>
                </footer>
            </Router>
        </AuthProvider>
    );
};

export default App;

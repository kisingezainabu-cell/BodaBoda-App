import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Menu, X, Bike, User } from 'lucide-react';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            {/* Logo - Restored to original green box style but with better shadow */}
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-600/30">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">BodaConnect</span>
          </Link>
          
          {/* Desktop Menu - Restored to original button-like links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/request"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/request') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Request Ride
            </Link>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            {user ? (
              <div className="flex items-center gap-2">
                {/* Only show dashboard for drivers and admins */}
                {(user.is_superuser || user.user_type === 'admin' || user.user_type === 'driver') && (
                  <Link 
                    to={
                      (user.is_superuser || user.user_type === 'admin') ? '/admin-dashboard' : '/driver-dashboard'
                    }
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/driver-dashboard') || isActive('/admin-dashboard')
                      ? 'text-emerald-700 bg-emerald-50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {(user.is_superuser || user.user_type === 'admin') ? 'Admin Panel' : 'Rider Portal'}
                  </Link>
                )}
                <button 
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-2"
                  title="Logout"
                >
                  <User size={18} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all border border-slate-300 text-slate-700 hover:bg-slate-50`}
              >
                Rider Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 p-2">
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg absolute w-full left-0 animate-fade-in">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`w-full block px-4 py-3 rounded-md text-base font-medium ${isActive('/') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'}`}>Home</Link>
          <Link to="/request" onClick={() => setIsMobileMenuOpen(false)} className={`w-full block px-4 py-3 rounded-md text-base font-medium ${isActive('/request') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'}`}>Request Ride</Link>
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <>
                {(user.is_superuser || user.user_type === 'admin' || user.user_type === 'driver') && (
                  <Link 
                    to={(user.is_superuser || user.user_type === 'admin') ? '/admin-dashboard' : '/driver-dashboard'} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="w-full block px-4 py-3 rounded-md text-base font-medium border border-emerald-600 text-emerald-700 bg-emerald-50 mb-2"
                  >
                    {(user.is_superuser || user.user_type === 'admin') ? 'Admin Panel' : 'Rider Portal'}
                  </Link>
                )}
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-md text-base font-medium text-red-600">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full block px-4 py-3 rounded-md text-base font-medium border border-slate-300 text-slate-700">Rider Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

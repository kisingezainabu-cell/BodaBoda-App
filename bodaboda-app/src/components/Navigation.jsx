import React from 'react';

const Navigation = ({ currentPage, onNavigate }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            {/* Logo */}
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center mr-3 shadow-sm">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">BodaConnect</span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'home' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('request')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'request' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Request Ride
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
            <button 
              onClick={() => onNavigate('login')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                currentPage === 'login' || currentPage === 'dashboard' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50' 
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {currentPage === 'dashboard' ? 'Dashboard' : 'Rider Login'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

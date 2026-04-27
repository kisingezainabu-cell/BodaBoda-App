import React, { useState } from 'react';

const Navigation = ({ currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => handleNav('home')}>
            {/* Logo */}
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center mr-3 shadow-sm shrink-0">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">BodaConnect</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'home' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => handleNav('request')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'request' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Request Ride
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <button 
              onClick={() => handleNav('login')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                currentPage === 'login' || currentPage === 'dashboard' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50' 
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {currentPage === 'dashboard' ? 'Dashboard' : 'Rider Login'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-slate-900 p-2">
               <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 {isMobileMenuOpen ? (
                   <path d="M18 6L6 18M6 6l12 12" />
                 ) : (
                   <path d="M3 12h18M3 6h18M3 18h18" />
                 )}
               </svg>
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg absolute w-full left-0">
          <button 
            onClick={() => handleNav('home')}
            className={`w-full text-left px-4 py-3 rounded-md text-base font-medium ${
              currentPage === 'home' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => handleNav('request')}
            className={`w-full text-left px-4 py-3 rounded-md text-base font-medium ${
              currentPage === 'request' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Request Ride
          </button>
          <button 
            onClick={() => handleNav('login')}
            className={`w-full text-left px-4 py-3 rounded-md text-base font-medium border mt-2 ${
              currentPage === 'login' || currentPage === 'dashboard' 
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50' 
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {currentPage === 'dashboard' ? 'Dashboard' : 'Rider Login'}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

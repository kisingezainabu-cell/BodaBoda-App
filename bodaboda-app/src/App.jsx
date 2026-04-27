import { useState } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import RequestRide from './pages/RequestRide';
import RiderLogin from './pages/RiderLogin';
import RiderDashboard from './pages/RiderDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [riderName, setRiderName] = useState('Demo Rider');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'request':
        return <RequestRide onNavigate={setCurrentPage} />;
      case 'login':
        return <RiderLogin onNavigate={setCurrentPage} onLogin={(name) => {
          setRiderName(name);
          setCurrentPage('dashboard');
        }} />;
      case 'dashboard':
        return <RiderDashboard riderName={riderName} onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-grow flex flex-col">
        {renderPage()}
      </main>
      
      {/* Simple Footer */}
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

export default App;

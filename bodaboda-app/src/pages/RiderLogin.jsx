import React, { useState } from 'react';

const RiderLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!credentials.phone || !credentials.password) {
      setError('Please enter both phone and password');
      return;
    }
    // Simple demo logic
    onLogin('Juma Makoye');
  };

  const handleDemoFill = () => {
    setCredentials({ phone: '0712345678', password: 'demo' });
    setError('');
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl mx-auto flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Rider Portal</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to manage your trips and earnings</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
              placeholder="07xx xxx xxx"
              value={credentials.phone}
              onChange={(e) => setCredentials({...credentials, phone: e.target.value})}
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Forgot?</a>
            </div>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-lg shadow-sm transition-all active:scale-[0.98]"
          >
            Login to Dashboard
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900">Demo Access</h4>
              <p className="text-xs text-blue-700 mt-1">Use demo credentials to see the dashboard.</p>
              <button 
                onClick={handleDemoFill}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                Auto-fill credentials
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RiderLogin;

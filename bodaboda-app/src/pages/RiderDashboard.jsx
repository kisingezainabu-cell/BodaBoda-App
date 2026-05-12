import React from 'react';
import { useAuth } from '../AuthContext';
import { MapPin, Navigation, History, CreditCard, Star, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RiderDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex-grow bg-slate-50 min-h-screen pb-20 font-sans">
      <div className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">Passenger Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Welcome back, {user?.full_name || user?.username}!</p>
          </div>
          <Link to="/request" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2">
            <Navigation size={20} /> Request New Ride
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                <History size={24} className="mb-4 opacity-80" />
                <p className="text-3xl font-bold">12</p>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">Total Trips</p>
            </div>
            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                <CreditCard size={24} className="mb-4 opacity-80" />
                <p className="text-3xl font-bold">TSh 4,500</p>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">Wallet Balance</p>
            </div>
            <div className="bg-orange-500 p-6 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                <Star size={24} className="mb-4 opacity-80" />
                <p className="text-3xl font-bold">4.9</p>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">Rider Rating</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl text-white shadow-lg shadow-slate-800/20">
                <Clock size={24} className="mb-4 opacity-80" />
                <p className="text-3xl font-bold">45m</p>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">Time Saved</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Trips</h2>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-emerald-300 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Ride to Sabasaba Market</h4>
                                <p className="text-sm text-slate-500">Yesterday • 4:20 PM</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-900">TSh 2,500</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase">Completed</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-emerald-700">
                    {user?.username[0].toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{user?.full_name || user?.username}</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1 mb-6">Standard Rider</p>
                <button className="w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">Edit Profile</button>
                <button onClick={logout} className="w-full mt-3 py-3 text-red-500 font-bold hover:underline">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;

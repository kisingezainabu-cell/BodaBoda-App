import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { MapPin, Navigation, DollarSign, Award, Target, Power, ChevronRight, Bell, X, History, Clock, User } from 'lucide-react';

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [availableRides, setAvailableRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const lastRidesCount = useRef(0);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
        fetchAvailableRides();
        fetchTripHistory();
        const interval = setInterval(fetchAvailableRides, 5000);
        return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAvailableRides = async () => {
    try {
      const rides = await api.getAvailableRides();
      if (isOnline && rides.length > lastRidesCount.current && !activeRide) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 10000);
      }
      lastRidesCount.current = rides.length;
      setAvailableRides(rides);
    } catch (err) {
      console.error("Failed to fetch rides", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripHistory = async () => {
    try {
      const data = await api.getDriverHistory();
      setTripHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const ride = await api.acceptRide(rideId);
      setActiveRide(ride);
      setShowNotification(false);
      fetchAvailableRides();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const updatedRide = await api.updateStatus(activeRide.id, newStatus);
      setActiveRide(updatedRide);
      if (newStatus === 'completed') {
          setActiveRide(null);
          fetchTripHistory(); // Refresh history after completion
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-grow bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      {/* Notification Bar */}
      {isOnline && showNotification && availableRides.length > 0 && (
          <div className="bg-orange-500 text-white py-3 px-4 shadow-lg animate-bounce sticky top-16 z-40">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <Bell size={20} className="animate-ring" />
                      <p className="font-bold text-sm">New Ride Request: {availableRides[0].pickup_location} → {availableRides[0].destination_location}</p>
                  </div>
                  <button onClick={() => setShowNotification(false)}><X size={20} /></button>
              </div>
          </div>
      )}

      <div className={`transition-colors duration-500 ${isOnline ? 'bg-emerald-700' : 'bg-slate-900'} py-12`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-white">
          <div>
            <h1 className="text-3xl font-bold mb-1">Rider Portal: {user?.full_name || user?.username}</h1>
            <p className="text-white/60 font-medium">{user?.vehicle_make} • {user?.license_plate}</p>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all active:scale-95 ${
              isOnline ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
            }`}
          >
            <Power size={24} />
            {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
                    <DollarSign size={24} className="text-emerald-500 mb-4" />
                    <p className="text-3xl font-bold">TSh {tripHistory.reduce((acc, curr) => acc + parseInt(curr.price), 0).toLocaleString()}</p>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-50 mt-1">Total Earnings</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <History className="text-blue-500" />
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Trips Completed</p>
                            <p className="font-bold text-slate-900">{tripHistory.length}</p>
                        </div>
                    </div>
                </div>
                <button onClick={logout} className="w-full py-4 text-red-500 font-bold border border-red-100 rounded-2xl hover:bg-red-50 transition-all">Logout</button>
            </div>

            <div className="lg:col-span-3 space-y-10">
                {activeRide ? (
                    <div className="bg-white rounded-3xl border-2 border-emerald-500 p-8 shadow-2xl animate-fade-in">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Navigation className="text-emerald-500" /> Active Trip</h2>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Customer</p>
                                <p className="text-2xl font-bold text-slate-900 mb-1">{activeRide.rider_details?.full_name || activeRide.rider_details?.username}</p>
                                <p className="text-slate-500 font-bold mb-6">{activeRide.rider_details?.phone_number}</p>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-px bg-slate-200 h-10 relative"><div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-emerald-500"></div></div>
                                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Pickup</p><p className="font-bold text-slate-900">{activeRide.pickup_location}</p></div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-px bg-slate-200 h-10 relative"><div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-blue-500"></div></div>
                                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Destination</p><p className="font-bold text-slate-900">{activeRide.destination_location}</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Price</p>
                                <p className="text-4xl font-bold text-slate-900 mb-8">TSh {activeRide.price}</p>
                                {activeRide.status === 'accepted' ? (
                                    <button onClick={() => handleUpdateStatus('started')} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg">START TRIP</button>
                                ) : (
                                    <button onClick={() => handleUpdateStatus('completed')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg">COMPLETE TRIP</button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : isOnline ? (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Available Requests</h2>
                        {availableRides.length === 0 ? (
                            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                                <p className="text-slate-400 font-bold">Scanning for customers...</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {availableRides.map(ride => (
                                    <div key={ride.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between mb-4">
                                            <p className="font-bold text-lg text-slate-900">TSh {ride.price}</p>
                                            <span className="text-[10px] font-black uppercase text-emerald-600">New Request</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-4">{ride.pickup_location} → {ride.destination_location}</p>
                                        <button onClick={() => handleAcceptRide(ride.id)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Accept Trip</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 p-24 text-center">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">You are Offline</h3>
                        <button onClick={() => setIsOnline(true)} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold">Go Online</button>
                    </div>
                )}

                {/* Trip History Section */}
                <div className="pt-10 border-t border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3"><History className="text-slate-400" /> Completed Journey History</h2>
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">
                                        <th className="px-8 py-4">Passenger Name</th>
                                        <th className="px-8 py-4">Route</th>
                                        <th className="px-8 py-4">Time Completed</th>
                                        <th className="px-8 py-4 text-right">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {tripHistory.length === 0 ? (
                                        <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-400 font-medium">No completed journeys yet.</td></tr>
                                    ) : (
                                        tripHistory.map(trip => (
                                            <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User size={14} /></div>
                                                        <p className="font-bold text-slate-900 text-sm">{trip.rider_details?.full_name || trip.rider_details?.username}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{trip.pickup_location} → {trip.destination_location}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                        <Clock size={12} /> {new Date(trip.updated_at).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <p className="font-bold text-emerald-600 text-sm">TSh {trip.price}</p>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

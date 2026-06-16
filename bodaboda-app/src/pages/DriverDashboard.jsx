import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import MapComponent from '../components/MapComponent';
import { connectRealtime } from '../realtime';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Bell, 
  History, 
  LogOut, 
  ChevronRight,
  Circle,
  TrendingUp,
  DollarSign,
  User,
  Phone,
  Star,
  Search,
  Wallet,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const [availableRides, setAvailableRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [history, setHistory] = useState([]);
  const [isOnline, setIsOnline] = useState(user?.is_online || false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtimeState, setRealtimeState] = useState('connecting');

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [{
      id: Date.now() + Math.random(),
      message,
      type,
    }, ...prev].slice(0, 8));
  };

  const upsertAvailableRide = (ride) => {
    setAvailableRides(prev => {
      const existingIndex = prev.findIndex(item => item.id === ride.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], ...ride };
        return next;
      }
      return [ride, ...prev];
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isOnline]);

  useEffect(() => {
    if (!user || user.user_type !== 'driver') {
      return undefined;
    }

    return connectRealtime({
      user,
      onConnectionChange: setRealtimeState,
      onRideRequest: (ride) => {
        const isTargetDriver = !ride.driver_id || ride.driver_id === user.id;
        if (!isOnline || activeRide || !isTargetDriver || ride.status !== 'requested') {
          return;
        }

        upsertAvailableRide(ride);
        addNotification(
          `New Request: ${ride.pickup_location} to ${ride.destination_location}`,
          'new_ride'
        );
      },
      onRideStatus: (rideUpdate) => {
        setAvailableRides(prev => prev.filter(ride => {
          if (ride.id !== rideUpdate.ride_id) {
            return true;
          }
          return rideUpdate.status === 'requested';
        }));

        if (activeRide && activeRide.id === rideUpdate.ride_id) {
          if (rideUpdate.status === 'completed' || rideUpdate.status === 'cancelled') {
            setActiveRide(null);
            fetchData();
          } else {
            setActiveRide(prev => prev ? { ...prev, status: rideUpdate.status, updated_at: rideUpdate.updated_at } : prev);
          }
        }

        if (rideUpdate.driver_id === user.id) {
          addNotification(`Ride ${rideUpdate.status}`, rideUpdate.status === 'accepted' ? 'success' : 'info');
        }
      },
    });
  }, [user, isOnline, activeRide]);

  const fetchData = async () => {
    try {
      if (isOnline && !activeRide) {
        const rides = await api.getAvailableRides();
        setAvailableRides(rides);
        
        if (rides.length > availableRides.length) {
            const newRide = rides[0];
            addNotification(`New Request: ${newRide.pickup_location} to ${newRide.destination_location}`, 'new_ride');
        }
      }
      
      const historyData = await api.getDriverHistory();
      setHistory(historyData.rides || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const toggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await api.updateProfile({ is_online: newStatus });
      setIsOnline(newStatus);
      if (!newStatus) setAvailableRides([]);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const acceptRide = async (rideId) => {
    try {
      const ride = await api.acceptRide(rideId);
      setActiveRide(ride);
      setAvailableRides([]);
      addNotification("Trip Accepted! Navigate to pickup.", 'success');
    } catch (err) {
      alert(err.message);
    }
  };

  const rejectRide = async (rideId) => {
    try {
      await api.rejectRide(rideId);
      setAvailableRides(prev => prev.filter(r => r.id !== rideId));
      addNotification("Request declined.", 'info');
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject request: " + err.message);
    }
  };

  const updateStatus = async (status) => {
    try {
      const updated = await api.updateStatus(activeRide.id, status);
      setActiveRide(updated);
      if (status === 'completed') {
        setActiveRide(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const getMarkers = () => {
      if (activeRide) {
          return [
              { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng, type: 'passenger', label: 'Pickup', subLabel: activeRide.guest_name || activeRide.rider_details?.full_name },
              { lat: activeRide.destination_lat, lng: activeRide.destination_lng, type: 'destination', label: 'Drop-off', subLabel: activeRide.destination_location }
          ];
      }
      
      if (availableRides.length > 0) {
          return availableRides.map(r => ({
              lat: r.pickup_lat,
              lng: r.pickup_lng,
              type: 'passenger',
              label: `Request: TSh ${r.price}`,
              subLabel: r.pickup_location
          }));
      }

      return [];
  };

  const totalEarnings = history.reduce((acc, r) => acc + parseFloat(r.price), 0);
  const todayTrips = history.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="flex-grow bg-[#f8fafc] min-h-screen pb-20 font-sans">
      {/* Premium Header with Dynamic Gradient */}
      <div className="bg-[#0f172a] pt-12 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full -mr-64 -mt-64 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/20 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-[32px] bg-grad-emerald flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-white/10 overflow-hidden">
                    {user?.username?.[0].toUpperCase()}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-[#0f172a] ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'} shadow-lg`}></div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Hello, {user?.full_name || user?.username}!</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-white/5 text-emerald-400 text-xs font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                    <Star size={14} className="fill-emerald-400" /> 4.9 Rating
                  </span>
                  <span className="text-slate-400 text-sm font-bold opacity-60">Dodoma Partner ID: #BD-{user?.id}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
                <button 
                    onClick={toggleOnline}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-4 px-10 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest transition-all duration-500 shadow-2xl ${
                    isOnline 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/40 hover:bg-emerald-500 scale-105' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                >
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-600'}`}></div>
                    {isOnline ? 'You are Live' : 'Go Online'}
                </button>
                <button onClick={logout} className="p-5 rounded-[28px] bg-slate-800 text-slate-400 border border-slate-700 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                    <LogOut size={24} />
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Earnings Card - HIGH CONTRAST & PREMIUM */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[40px] shadow-premium p-10 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mb-8 shadow-xl shadow-emerald-600/20">
                        <Wallet size={32} />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Total Earnings</p>
                    <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-sm font-black text-slate-900 opacity-40">TSh</span>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{totalEarnings.toLocaleString()}</h2>
                    </div>
                    
                    <div className="space-y-4 pt-8 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <p className="text-xs font-bold text-slate-500">Daily Goal</p>
                            </div>
                            <p className="text-xs font-black text-slate-900">75%</p>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="w-[75%] h-full bg-emerald-500 rounded-full"></div>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <TrendingUp size={12} /> +12% from yesterday
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-grad-dark rounded-[40px] shadow-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-xs font-black text-white/40 uppercase tracking-[2px] mb-6">Activity Hub</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                            <p className="text-3xl font-black mb-1">{todayTrips}</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase">Trips Today</p>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                            <p className="text-3xl font-black mb-1">4.2</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase">Hours Active</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Live Map with Premium Frame */}
                <div className="bg-white rounded-[40px] shadow-premium border border-slate-200 overflow-hidden h-[500px] relative">
                    <MapComponent markers={getMarkers()} />
                    <div className="absolute top-6 left-6 right-6 bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-white/10 z-[1000] flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`}></div>
                            <p className="text-white text-[10px] font-black uppercase tracking-widest">
                                {isOnline ? 'Live in Dodoma' : 'Tracking Offline'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg ${
                                realtimeState === 'connected'
                                  ? 'bg-sky-500 text-white'
                                  : 'bg-slate-700 text-slate-200'
                              }`}>
                                MQTT {realtimeState}
                            </div>
                            {availableRides.length > 0 && (
                                <div className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-lg">
                                    {availableRides.length} REQUESTS
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status and Notifications */}
                <div className="space-y-8">
                    {activeRide ? (
                        <div className="bg-white rounded-[40px] shadow-2xl border-4 border-emerald-500 p-10 animate-fade-in relative overflow-hidden h-full flex flex-col">
                            <div className="absolute top-0 right-0 p-8 text-emerald-50 opacity-20 transform translate-x-1/4 -translate-y-1/4"><Bike size={200} /></div>
                            <div className="relative z-10 flex-grow">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="px-4 py-2 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Current Trip</span>
                                        <h3 className="text-3xl font-black text-slate-900 mt-6 tracking-tight">On the Road</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trip Value</p>
                                        <p className="text-3xl font-black text-emerald-600">TSh {activeRide.price}</p>
                                    </div>
                                </div>

                                <div className="space-y-8 mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm"><MapPin className="text-emerald-500" size={24} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pickup</p>
                                            <p className="font-bold text-slate-900 text-lg line-clamp-1">{activeRide.pickup_location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm"><Navigation className="text-blue-500" size={24} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop-off</p>
                                            <p className="font-bold text-slate-900 text-lg line-clamp-1">{activeRide.destination_location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 mb-8 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 shadow-sm">
                                            {(activeRide.guest_name || activeRide.rider_details?.username)?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{activeRide.guest_name || activeRide.rider_details?.full_name}</p>
                                            <p className="text-xs font-bold text-slate-400">Guest Passenger</p>
                                        </div>
                                    </div>
                                    <button className="p-4 bg-white rounded-2xl text-emerald-600 shadow-sm border border-slate-100 hover:bg-emerald-50 transition-all"><Phone size={20} /></button>
                                </div>
                            </div>

                            <div className="flex gap-4 relative z-10">
                                {activeRide.status === 'accepted' && (
                                    <button onClick={() => updateStatus('started')} className="flex-1 py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-black transition-all">Start Journey</button>
                                )}
                                {activeRide.status === 'started' && (
                                    <button onClick={() => updateStatus('completed')} className="flex-1 py-6 bg-emerald-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all">Complete Trip</button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[40px] shadow-premium p-10 border border-slate-100 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Trip Offers</h3>
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-emerald-700 uppercase">Searching</span>
                                </div>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                                {!isOnline ? (
                                    <div className="py-20 text-center">
                                        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6"><Bell size={40} /></div>
                                        <h4 className="text-xl font-bold text-slate-300">Offline Mode</h4>
                                        <p className="text-slate-400 text-sm mt-2">Go online to see ride requests.</p>
                                    </div>
                                ) : availableRides.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="w-24 h-24 bg-emerald-50 text-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><Search size={40} /></div>
                                        <h4 className="text-xl font-bold text-slate-900">Waiting for Passenger...</h4>
                                        <p className="text-slate-500 text-sm mt-2 px-8">Stay near central Dodoma for higher chances of getting matched.</p>
                                    </div>
                                ) : (
                                    availableRides.map(ride => (
                                        <div key={ride.id} className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 hover:border-emerald-300 hover:bg-white hover:shadow-2xl transition-all group relative animate-fade-in">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Offer</p>
                                                    <p className="text-2xl font-black text-emerald-600">TSh {ride.price}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm"><ArrowUpRight size={24} /></div>
                                            </div>
                                            <div className="space-y-4 mb-8">
                                                <div className="flex gap-4">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2"></div>
                                                    <p className="text-sm font-bold text-slate-700">{ride.pickup_location}</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-2"></div>
                                                    <p className="text-sm font-bold text-slate-700">{ride.destination_location}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => acceptRide(ride.id)} 
                                                    className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-black shadow-xl transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    onClick={() => rejectRide(ride.id)} 
                                                    className="px-6 py-5 bg-white border border-slate-200 text-slate-400 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent History Grid */}
            <div className="bg-white rounded-[40px] shadow-premium p-10 border border-slate-100">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Journey History</h3>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><Calendar size={20} /></button>
                        <button className="text-sm font-black text-emerald-600 hover:underline uppercase tracking-widest">See All</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {history.slice(0, 6).map(ride => (
                        <div key={ride.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-5 hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-black text-slate-400 group-hover:text-emerald-600 transition-colors shadow-sm">
                                {ride.id}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate mb-1">{ride.destination_location}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(ride.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase">Paid</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900">+{ride.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

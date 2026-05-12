import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { ChevronRight, MapPin, Navigation, Clock, User, CheckCircle, Search, Info, Bike, DollarSign, Map as MapIcon, Star, Phone } from 'lucide-react';

const RequestRide = () => {
  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
    guest_name: '',
    guest_phone: ''
  });
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, choosing, searching, found
  const [activeRide, setActiveRide] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchNearbyDrivers();
    const interval = setInterval(fetchNearbyDrivers, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval;
    if (status === 'searching' && activeRide) {
        interval = setInterval(async () => {
            try {
                const ride = await api.getRideDetail(activeRide.id);
                if (ride.status === 'accepted') {
                    setActiveRide(ride);
                    setStatus('found');
                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Error polling ride status", err);
            }
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, activeRide]);

  const fetchNearbyDrivers = async () => {
    try {
      const drivers = await api.getOnlineDrivers();
      setNearbyDrivers(drivers);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    }
  };

  const handleCalculatePrice = () => {
    if (!formData.pickup || !formData.destination) return;
    
    // Check if guest info is needed
    if (!user && (!formData.guest_name || !formData.guest_phone)) {
        alert("Please enter your name and phone number so the rider can contact you.");
        return;
    }

    setIsCalculating(true);
    setTimeout(() => {
        const baseFare = 1500;
        const seed = (formData.pickup.length * formData.destination.length);
        const distanceFactor = (seed % 10) * 400 + 500; 
        setEstimatedPrice(baseFare + distanceFactor);
        setIsCalculating(false);
        setStatus('choosing');
    }, 800);
  };

  const handleRequestDriver = async (driverId) => {
    setStatus('searching');
    try {
        const ride = await api.requestRide({
            pickup_location: formData.pickup,
            destination_location: formData.destination,
            price: estimatedPrice,
            driver_id: driverId,
            guest_name: formData.guest_name,
            guest_phone: formData.guest_phone
        });
        setActiveRide(ride);
    } catch (err) {
        alert(err.message);
        setStatus('choosing');
    }
  };

  return (
    <div className="flex-grow bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      <div className="bg-emerald-600 py-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
            <h1 className="text-3xl font-black text-white mb-2">BodaBoda Direct</h1>
            <p className="text-emerald-100 font-medium">Quick rides for everyone. No account needed.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-200 p-8 sticky top-24">
                {status === 'idle' && (
                    <form className="space-y-6">
                        {/* Guest Information (Only if not logged in) */}
                        {!user && (
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info (Guest)</p>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                    <input 
                                        type="text" 
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Your Name"
                                        value={formData.guest_name}
                                        onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                    <input 
                                        type="tel" 
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Phone Number"
                                        value={formData.guest_phone}
                                        onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pickup</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 text-emerald-500" size={18} />
                                    <input 
                                        type="text" 
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        placeholder="Pickup location"
                                        value={formData.pickup}
                                        onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Destination</label>
                                <div className="relative">
                                    <Navigation className="absolute left-4 top-3.5 text-orange-500" size={18} />
                                    <input 
                                        type="text" 
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        placeholder="Destination"
                                        value={formData.destination}
                                        onChange={(e) => setFormData({...formData, destination: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="button"
                            onClick={handleCalculatePrice}
                            disabled={!formData.pickup || !formData.destination || isCalculating}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isCalculating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search size={20} />}
                            {isCalculating ? 'Mapping...' : 'Find Available Riders'}
                        </button>
                    </form>
                )}

                {status === 'choosing' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Estimated Fare</p>
                            <p className="text-4xl font-black text-emerald-700">TSh {estimatedPrice?.toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-slate-500 text-center px-4 font-medium italic">Please select a rider from the list to send your request.</p>
                        <button onClick={() => setStatus('idle')} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all">Change Route</button>
                    </div>
                )}

                {status === 'searching' && (
                    <div className="text-center py-16 animate-fade-in">
                        <div className="relative w-24 h-24 mx-auto mb-10">
                            <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-emerald-600"><Bike size={32} /></div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Sent!</h2>
                        <p className="text-slate-500 mb-10 px-4">Waiting for the rider to confirm your trip...</p>
                        <button onClick={() => setStatus('choosing')} className="text-red-500 font-bold hover:underline">Cancel & Reselect</button>
                    </div>
                )}

                {status === 'found' && (
                    <div className="text-center py-10 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Trip Confirmed!</h2>
                        <p className="text-slate-500 mb-10">Your rider is coming to you.</p>
                        
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left mb-10">
                            <p className="font-bold text-slate-900 text-lg mb-1">{activeRide?.driver_details?.full_name}</p>
                            <p className="text-xs font-bold text-emerald-600 mb-4">{activeRide?.driver_details?.license_plate}</p>
                            <div className="flex justify-between pt-4 border-t border-slate-200">
                                <div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Fare</p><p className="font-bold">TSh {activeRide?.price}</p></div>
                                <div className="text-right"><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Status</p><p className="font-bold text-emerald-600 uppercase text-[10px]">{activeRide?.status}</p></div>
                            </div>
                        </div>
                        <button onClick={() => setStatus('idle')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Book Another Trip</button>
                    </div>
                )}
            </div>
          </div>

          {/* Map and Rider Selection List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden h-[450px] relative">
                <iframe 
                    src="https://www.openstreetmap.org/export/embed.html?bbox=35.65,-6.22,35.82,-6.12&layer=mapnik" 
                    width="100%" height="100%" style={{ border: 0 }} title="Map"
                ></iframe>
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-5 py-2.5 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-sm font-black text-slate-900">{nearbyDrivers.length} Available Riders Nearby</p>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    {status === 'choosing' ? 'Select Your Rider' : 'Nearby Riders'}
                </h3>
                
                {nearbyDrivers.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                        <Bike size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Searching for online riders in Dodoma...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {nearbyDrivers.map(dr => (
                            <div key={dr.id} className={`p-8 bg-slate-50 rounded-[32px] border transition-all ${status === 'choosing' ? 'border-emerald-100 hover:border-emerald-400 hover:bg-white hover:shadow-2xl hover:scale-[1.02] cursor-pointer ring-offset-4 ring-emerald-500' : 'border-slate-100'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-2xl shadow-sm">
                                        {dr.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                        <Star size={12} className="text-orange-400 fill-orange-400" />
                                        <span className="text-[10px] font-black text-slate-700">4.9</span>
                                    </div>
                                </div>
                                
                                <div className="mb-8">
                                    <p className="font-bold text-slate-900 text-xl mb-1">{dr.full_name || dr.username}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dr.vehicle_make}</p>
                                        <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase">3 min away</p>
                                    </div>
                                </div>

                                {status === 'choosing' ? (
                                    <button 
                                        onClick={() => handleRequestDriver(dr.id)}
                                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        Book This Rider <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <CheckCircle size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Available Now</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestRide;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import MapComponent from '../components/MapComponent';
import { MapPin, Navigation, Clock, User, CheckCircle, Search, Info, Bike, DollarSign, Map as MapIcon, ChevronRight, Star, Phone, Loader2 } from 'lucide-react';

const RequestRide = () => {
  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
  });
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, choosing, searching, found
  const [activeRide, setActiveRide] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const { user } = useAuth();

  const fetchNearbyDrivers = async () => {
    try {
      const drivers = await api.getOnlineDrivers();
      setNearbyDrivers(drivers);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    }
  };

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

  const handleCalculatePrice = () => {
    if (!formData.pickup || !formData.destination) return;
    
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
    setSelectedDriverId(driverId);
    setStatus('searching');
    try {
        const ride = await api.requestRide({
            pickup_location: formData.pickup,
            destination_location: formData.destination,
            price: estimatedPrice,
            driver_id: driverId,
            // Pass placeholder for guest info to satisfy backend if needed, 
            // but we removed the UI fields as requested.
            guest_name: "Guest Passenger",
            guest_phone: "000-000-0000"
        });
        setActiveRide(ride);
    } catch (err) {
        alert(err.message);
        setStatus('choosing');
        setSelectedDriverId(null);
    }
  };

  const resetSelection = () => {
      setStatus('choosing');
      setSelectedDriverId(null);
      setActiveRide(null);
  };

  const getMarkers = () => {
      if (status === 'found' && activeRide) {
          return [
              { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng, type: 'passenger', label: 'Pickup Point', subLabel: activeRide.pickup_location },
              { lat: activeRide.destination_lat, lng: activeRide.destination_lng, type: 'destination', label: 'Destination', subLabel: activeRide.destination_location },
              { lat: activeRide.driver_details?.current_lat || activeRide.pickup_lat + 0.005, lng: activeRide.driver_details?.current_lng || activeRide.pickup_lng + 0.005, type: 'rider', label: 'Rider', subLabel: activeRide.driver_details?.full_name }
          ];
      }
      
      if (status === 'searching' && activeRide) {
          return [
              { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng, type: 'passenger', label: 'Your Location', subLabel: activeRide.pickup_location },
              { lat: nearbyDrivers.find(d => d.id === selectedDriverId)?.current_lat || activeRide.pickup_lat + 0.01, lng: nearbyDrivers.find(d => d.id === selectedDriverId)?.current_lng || activeRide.pickup_lng + 0.01, type: 'rider', label: 'Requested Rider' }
          ];
      }

      if (status === 'choosing' || status === 'idle') {
          return nearbyDrivers.map(d => ({
              lat: d.current_lat || -6.1722 + (Math.random() - 0.5) * 0.02,
              lng: d.current_lng || 35.7481 + (Math.random() - 0.5) * 0.02,
              type: 'rider',
              label: d.full_name || d.username,
              subLabel: d.vehicle_make
          }));
      }

      return [];
  };

  return (
    <div className="flex-grow bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      <div className="bg-emerald-600 py-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
            <h1 className="text-3xl font-black text-white mb-2">BodaBoda Direct</h1>
            <p className="text-emerald-100 font-medium">Fast, frictionless booking like Bolt.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-200 p-8 sticky top-24">
                {status === 'idle' && (
                    <form className="space-y-6">
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
                            {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search size={20} />}
                            {isCalculating ? 'Mapping...' : 'Find Available Riders'}
                        </button>
                    </form>
                )}

                {(status === 'choosing' || (status === 'searching' && selectedDriverId)) && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Estimated Fare</p>
                            <p className="text-4xl font-black text-emerald-700">TSh {estimatedPrice?.toLocaleString()}</p>
                        </div>
                        
                        {status === 'searching' ? (
                             <div className="text-center py-6">
                                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-bold text-slate-900 mb-1">Waiting for Rider...</p>
                                <p className="text-xs text-slate-400 mb-6">Request sent to your selected rider.</p>
                                <button onClick={resetSelection} className="text-red-500 text-xs font-bold uppercase tracking-widest hover:underline">Cancel & Reselect</button>
                             </div>
                        ) : (
                            <>
                                <p className="text-sm text-slate-500 text-center px-4 font-medium italic">Please select a rider from the list to send your request.</p>
                                <button onClick={() => setStatus('idle')} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all">Change Route</button>
                            </>
                        )}
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
                        <button onClick={() => { setStatus('idle'); setSelectedDriverId(null); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Book Another Trip</button>
                    </div>
                )}
            </div>
          </div>

          {/* Map and Rider Selection List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden h-[450px] relative">
                <MapComponent markers={getMarkers()} status={status} />
                
                {status === 'idle' && (
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-5 py-2.5 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-3 z-[1000]">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-sm font-black text-slate-900">{nearbyDrivers.length} Available Riders Nearby</p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    {status === 'choosing' ? 'Select Your Rider' : status === 'searching' ? 'Selected Rider' : 'Nearby Riders'}
                </h3>
                
                {nearbyDrivers.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                        <Bike size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Searching for online riders in Dodoma...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {nearbyDrivers.map(dr => {
                            const isSelected = selectedDriverId === dr.id;
                            const isSearching = status === 'searching' && isSelected;
                            const isDisabled = status === 'searching' && !isSelected;

                            return (
                                <div 
                                    key={dr.id} 
                                    className={`p-8 rounded-[32px] border transition-all duration-300 ${
                                        isSelected 
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xl scale-[1.02] z-10' 
                                        : isDisabled 
                                        ? 'bg-slate-50 border-slate-100 opacity-40 scale-95 grayscale pointer-events-none' 
                                        : 'bg-slate-50 border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-xl cursor-pointer'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm ${isSelected ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                                            {dr.username[0].toUpperCase()}
                                        </div>
                                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border shadow-sm ${isSelected ? 'bg-white/20 border-white/30' : 'bg-white border-slate-100'}`}>
                                            <Star size={12} className={isSelected ? 'text-white fill-white' : 'text-orange-400 fill-orange-400'} />
                                            <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-700'}`}>4.9</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-8">
                                        <p className={`font-bold text-xl mb-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>{dr.full_name || dr.username}</p>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>{dr.vehicle_make}</p>
                                            <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></div>
                                            <p className={`text-[10px] font-black uppercase ${isSelected ? 'text-white' : 'text-emerald-600'}`}>3 min away</p>
                                        </div>
                                    </div>

                                    {isSelected ? (
                                        <div className="flex items-center justify-center gap-3 py-4 bg-white/10 rounded-2xl font-bold">
                                            {isSearching ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Waiting for Confirmation...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={18} />
                                                    Rider Selected
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleRequestDriver(dr.id)}
                                            disabled={status === 'searching'}
                                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            Book This Rider <ChevronRight size={18} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
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

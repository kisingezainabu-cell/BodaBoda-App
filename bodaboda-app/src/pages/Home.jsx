import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ArrowRight, Shield, Clock, MapPin, Zap } from 'lucide-react';
import heroImg from '../assets/boda1.jpeg';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-full font-sans">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-50/50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-50/50 blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-6">
                <Zap size={14} /> The #1 Boda App in Dodoma
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-8">
                Fast, Reliable <br/>
                <span className="text-emerald-600">Boda Rides</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                Connect with verified riders instantly. Whether you're commuting to work or heading to the market, BodaConnect gets you there safely.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                    to="/request" 
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Book Your Ride Now <ArrowRight size={20} />
                </Link>
                {!user && (
                  <Link 
                      to="/login" 
                      className="px-8 py-4 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl font-bold text-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Rider Portal
                  </Link>
                )}
              </div>
              
              <div className="mt-12 flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Verified Riders</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Affordable</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Quick Response</div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-[40px] transform rotate-3 scale-105 opacity-50"></div>
              <img src={heroImg} alt="Boda Boda Rider" className="w-full h-auto object-cover rounded-[40px] shadow-2xl relative z-10 border-4 border-white" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Getting a ride has never been easier. Just follow these three simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 font-black text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">1</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Enter Location</h3>
              <p className="text-slate-600 leading-relaxed">Tell us where you are and where you want to go. We'll show you an upfront estimate.</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 font-black text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">2</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Get Matched</h3>
              <p className="text-slate-600 leading-relaxed">We'll instantly connect you with the nearest verified rider to minimize wait time.</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 font-black text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">3</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Enjoy Your Ride</h3>
              <p className="text-slate-600 leading-relaxed">Hop on and travel safely. Pay seamlessly with cash or mobile money upon arrival.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

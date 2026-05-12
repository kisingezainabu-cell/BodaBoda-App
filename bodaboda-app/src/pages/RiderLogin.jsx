import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { User, Mail, Lock, Phone, UserCircle, Bike, ChevronRight, Loader2 } from 'lucide-react';

const RiderLogin = ({ isRegister = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone_number: '',
    user_type: 'rider',
    vehicle_make: '',
    license_plate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(formData);
        navigate(formData.user_type === 'driver' ? '/driver-dashboard' : '/dashboard');
      } else {
        const response = await login(formData.email, formData.password);
        if (response.user.is_superuser || response.user.user_type === 'admin') {
          navigate('/admin-dashboard');
        } else if (response.user.user_type === 'driver') {
          navigate('/driver-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || (isRegister ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-50 px-4 py-12 md:py-20">
      <div className="w-full max-w-xl animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          <div className="bg-slate-900 p-8 md:p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-20 rounded-full -mr-10 -mt-10"></div>
             <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                <Bike className="text-emerald-500" size={32} />
             </div>
             <h1 className="text-3xl font-bold text-white mb-2">
                {isRegister ? 'Join BodaConnect' : 'Welcome Back'}
             </h1>
             <p className="text-slate-400 font-medium text-sm">
                {isRegister ? 'The future of transport in Dodoma' : 'Login to your portal'}
             </p>
          </div>

          <div className="p-8 md:p-12">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
                Error: {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {isRegister && (
                    <>
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                              name="username"
                              type="text"
                              required
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
                              placeholder="johndoe"
                              value={formData.username}
                              onChange={handleChange}
                            />
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                        <div className="relative">
                            <UserCircle className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                              name="full_name"
                              type="text"
                              required
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
                              placeholder="John Doe"
                              value={formData.full_name}
                              onChange={handleChange}
                            />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input
                          name="email"
                          type="email"
                          required
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
                          placeholder="name@email.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                    </div>
                  </div>

                  {isRegister && (
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                      <div className="relative">
                          <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input
                            name="phone_number"
                            type="tel"
                            required
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
                            placeholder="07xx xxx xxx"
                            value={formData.phone_number}
                            onChange={handleChange}
                          />
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input
                          name="password"
                          type="password"
                          required
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                        />
                    </div>
                  </div>

                  {isRegister && (
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Account Type</label>
                      <select
                        name="user_type"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
                        value={formData.user_type}
                        onChange={handleChange}
                      >
                        <option value="rider">Passenger (Customer)</option>
                        <option value="driver">Rider (Boda Operator)</option>
                      </select>
                    </div>
                  )}
              </div>

              {isRegister && formData.user_type === 'driver' && (
                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-fade-in grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Vehicle Information</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Make</label>
                    <input
                      name="vehicle_make"
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g. Boxer"
                      value={formData.vehicle_make}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Plate</label>
                    <input
                      name="license_plate"
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      placeholder="MC 123 ABC"
                      value={formData.license_plate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : (isRegister ? 'Create Account' : 'Login to Dashboard')}
                {!loading && <ChevronRight size={20} />}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium">
                {isRegister ? 'Already have an account?' : "Don't have an account?"} {' '}
                <Link to={isRegister ? '/login' : '/register'} className="text-emerald-600 font-bold hover:underline">
                  {isRegister ? 'Login here' : 'Join BodaConnect now'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderLogin;

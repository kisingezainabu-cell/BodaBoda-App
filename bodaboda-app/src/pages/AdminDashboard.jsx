import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Users, Bike, Map, Activity, ShieldCheck, DollarSign, Trash2, UserCog, Mail, Phone } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.manageUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
        try {
            await api.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            alert("User deleted successfully.");
        } catch (err) {
            alert(err.message);
        }
    }
  };

  return (
    <div className="flex-grow bg-slate-50 min-h-screen pb-20 font-sans">
      <div className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-white">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
            <p className="text-slate-400 font-medium mt-1">Global oversight of BodaConnect operations</p>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}
             >
                Overview
             </button>
             <button 
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}
             >
                User Management
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {activeTab === 'overview' && (
            <div className="animate-fade-in">
                {/* Management Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Users size={24} /></div>
                        <p className="text-3xl font-bold text-slate-900">{users.filter(u => u.user_type === 'rider').length}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Customers</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4"><Bike size={24} /></div>
                        <p className="text-3xl font-bold text-slate-900">{users.filter(u => u.user_type === 'driver').length}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Drivers</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4"><Activity size={24} /></div>
                        <p className="text-3xl font-bold text-slate-900">89</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Trips Today</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4"><DollarSign size={24} /></div>
                        <p className="text-3xl font-bold text-slate-900">TSh 2.4M</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Revenue</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900">Live Operations Map</h3>
                                <div className="flex gap-2 items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div> Live
                                </div>
                            </div>
                            <div className="h-[500px] bg-slate-100 relative">
                                <iframe 
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=35.65,-6.22,35.82,-6.12&layer=mapnik" 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    title="Admin Map"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
                            <ShieldCheck size={48} className="text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Security Hub</h3>
                            <p className="text-slate-500 text-sm mb-6">Review system alerts and driver verification requests.</p>
                            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Review 12 Pending Verifications</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="animate-fade-in bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">All Registered Users ({users.length})</h3>
                    <div className="flex gap-4">
                        <input type="text" placeholder="Search by name or email..." className="px-4 py-2 border border-slate-200 rounded-lg text-sm w-64" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-4">User Details</th>
                                <th className="px-8 py-4">Account Type</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Contact</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{u.full_name || u.username}</p>
                                                <p className="text-xs text-slate-400">@{u.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            u.user_type === 'driver' ? 'bg-emerald-100 text-emerald-700' : 
                                            u.user_type === 'admin' ? 'bg-slate-900 text-white' : 
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {u.user_type}
                                        </span>
                                        {u.is_superuser && <span className="ml-2 text-[10px] font-bold text-orange-600 underline">Superuser</span>}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-sm font-medium text-slate-700">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={12} /> {u.email}</div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={12} /> {u.phone_number || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><UserCog size={18} /></button>
                                            {!u.is_superuser && (
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="p-20 text-center text-slate-400 font-bold">Loading system data...</div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

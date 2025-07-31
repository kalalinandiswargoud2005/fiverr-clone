// client/src/pages/FreelancerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// Reusable UI Components
const StatCard = ({ title, value, icon, bgColor }) => (
  <div className={`p-6 rounded-2xl shadow-lg text-white ${bgColor}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider opacity-80">{title}</p>
        <p className="text-4xl font-bold">{value}</p>
      </div>
      <span className="text-5xl opacity-50">{icon}</span>
    </div>
  </div>
);

const ManagementGigCard = ({ gig, onDelete }) => (
    <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between transition-shadow hover:shadow-lg">
        <div className="flex items-center space-x-4">
            <img src={gig.cover_image_url} alt={gig.title} className="w-24 h-16 rounded-lg object-cover" />
            <div>
                <h3 className="font-bold text-gray-800 truncate max-w-xs">{gig.title}</h3>
                <p className="text-green-600 font-bold text-lg">${gig.price}</p>
            </div>
        </div>
        <div className="flex space-x-4">
            <Link to={`/gig/${gig.id}/edit`} className="text-blue-600 hover:underline font-semibold">Edit</Link>
            <button onClick={() => onDelete(gig.id)} className="text-red-600 hover:underline font-semibold">Archive</button>
        </div>
    </div>
);


const FreelancerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ earnings: 0, activeOrders: 0 });
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found.");

      const { data: userProfile } = await supabase.from('users').select('*').eq('id', user.id).single();
      setProfile(userProfile);

      const { data: gigsData } = await supabase.from('gigs').select('*').eq('seller_id', user.id).eq('is_archived', false);
      setGigs(gigsData || []);

      const { data: orderData } = await supabase.from('orders').select('price, status').eq('seller_id', user.id);
      const completed = orderData.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0);
      const active = orderData.filter(o => o.status === 'in_progress').length;
      setStats({ earnings: completed, activeOrders: active });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDelete = async (gigId) => {
    if (window.confirm("Are you sure you want to archive this gig?")) {
      const { error } = await supabase.from('gigs').update({ is_archived: true }).eq('id', gigId);
      if (error) alert("Error archiving gig: " + error.message);
      else setGigs(gigs.filter(g => g.id !== gigId));
    }
  };

  if (loading) return <p>Loading Dashboard...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-800">Freelancer Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back, {profile?.username}!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <StatCard title="TOTAL EARNINGS" value={`$${stats.earnings.toFixed(2)}`} icon={'💰'} bgColor="bg-gradient-to-r from-green-500 to-green-400" />
            <StatCard title="ACTIVE ORDERS" value={stats.activeOrders} icon={'📦'} bgColor="bg-gradient-to-r from-blue-500 to-blue-400" />
            <Link to="/create-gig" className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-center text-gray-700 font-bold text-lg hover:bg-gray-100 hover:text-fiverr-green transition-all">
                + Create New Gig
            </Link>
        </div>

        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Manage Your Gigs</h2>
            <div className="space-y-4">
                {gigs.length > 0 ? (
                    gigs.map(gig => <ManagementGigCard key={gig.id} gig={gig} onDelete={handleDelete} />)
                ) : (
                    <p>You haven't created any active gigs yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
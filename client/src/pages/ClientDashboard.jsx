// client/src/pages/ClientDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

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

const ClientDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ totalSpent: 0, activeOrders: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: userProfile } = await supabase.from('users').select('*').eq('id', user.id).single();
            setProfile(userProfile);
            
            const { data: orderData } = await supabase.from('orders').select('*, gigs(title)').eq('buyer_id', user.id);
            if (orderData) {
                setRecentOrders(orderData.slice(0, 5));
                const totalSpent = orderData.reduce((sum, o) => sum + o.price, 0);
                const active = orderData.filter(o => o.status === 'in_progress').length;
                setStats({ totalSpent, activeOrders: active });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) return <p className="text-center p-8 bg-gray-50 min-h-screen">Loading Dashboard...</p>;
    if (error) return <p className="text-center p-8 bg-gray-50 min-h-screen">Error: {error}</p>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-4xl font-bold text-gray-800">Client Dashboard</h1>
                <p className="text-gray-500 mt-2">Welcome back, {profile?.username}!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <StatCard title="TOTAL SPENT" value={`$${stats.totalSpent.toFixed(2)}`} icon={'💸'} bgColor="bg-gradient-to-r from-red-500 to-orange-400" />
                    <StatCard title="ACTIVE ORDERS" value={stats.activeOrders} icon={'📦'} bgColor="bg-gradient-to-r from-blue-500 to-blue-400" />
                </div>
                
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold text-gray-800 mb-4">Recent Orders</h3>
                        {recentOrders.length > 0 ? recentOrders.map(order => (
                            <div key={order.id} className="flex justify-between items-center border-b py-3">
                                <span className="truncate font-semibold">{order.gigs.title}</span>
                                <Link to={`/chat/${order.id}`} className="text-sm text-blue-500 font-semibold hover:underline">View</Link>
                            </div>
                        )) : <p>No recent orders.</p>}
                        <Link to="/orders" className="mt-4 inline-block text-skillora-green font-bold">View all orders →</Link>
                    </div>
                    <div className="bg-gradient-to-br from-green-400 to-blue-500 text-white p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
                        <h3 className="font-bold text-2xl mb-4">Ready to sell?</h3>
                        <p className="opacity-90 mb-6">Earn money doing what you love.</p>
                        <Link to="/create-gig" className="bg-white text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-200">
                            Become a Seller
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
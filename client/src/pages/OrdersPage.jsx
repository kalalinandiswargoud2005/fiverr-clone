// client/src/pages/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    const statusStyles = {
        'in_progress': { text: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: '⏳' },
        'completed': { text: 'Completed', color: 'bg-green-100 text-green-800', icon: '✅' },
        'cancelled': { text: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
    };
    const style = statusStyles[status] || { text: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '🕒' };
    return (
        <span className={`px-3 py-1 text-sm font-semibold rounded-full inline-flex items-center ${style.color}`}>
            <span className="mr-1.5">{style.icon}</span>
            {style.text}
        </span>
    );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const fetchUserAndOrders = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to view orders.");

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (!profile) throw new Error("User profile not found.");
      setUserRole(profile.role);

      const queryColumn = profile.role === 'client' ? 'buyer_id' : 'seller_id';
      
      const { data: basicOrders } = await supabase.from('orders').select('*').eq(queryColumn, user.id);
      if (!basicOrders) {
          setOrders([]);
          setLoading(false);
          return;
      }

      const gigIds = [...new Set(basicOrders.map(o => o.gig_id))];
      const userIds = [...new Set([...basicOrders.map(o => o.buyer_id), ...basicOrders.map(o => o.seller_id)])];
      const orderIds = basicOrders.map(o => o.id);

      const { data: gigsData } = await supabase.from('gigs').select('*').in('id', gigIds);
      const { data: usersData } = await supabase.from('users').select('*').in('id', userIds);
      const { data: reviewsData } = await supabase.from('reviews').select('*').in('order_id', orderIds);

      const hydratedOrders = basicOrders.map(order => ({
        ...order,
        gigs: gigsData.find(g => g.id === order.gig_id),
        buyer: usersData.find(u => u.id === order.buyer_id),
        seller: usersData.find(u => u.id === order.seller_id),
        reviews: reviewsData.filter(r => r.order_id === order.id),
      }));

      setOrders(hydratedOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchUserAndOrders();
  }, [fetchUserAndOrders]);

  // FIXED: Restored the handleCompleteOrder function
  const handleCompleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to mark this order as complete?")) {
      try {
        const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);
        if (error) throw error;
        fetchUserAndOrders(); // Refetch orders to show the updated status
      } catch (err) {
        alert("Error completing order: " + err.message);
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    const status = activeTab.toLowerCase().replace(' ', '_');
    return order.status === status;
  });

  const tabs = ['All', 'In Progress', 'Completed'];

  if (loading) return <p className="text-center p-8 bg-gray-50 min-h-screen">Loading your orders...</p>;
  if (error) return <p className="text-center p-8 bg-gray-50 min-h-screen text-red-500">Error: {error}</p>;

  const renderStatusActions = (order) => {
    if (order.status === 'completed' && userRole === 'client') {
        return <Link to={`/order/${order.id}/review`} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-green-600">Leave Review</Link>;
    }
    if (order.status === 'in_progress' && userRole === 'client') {
        return <button onClick={() => handleCompleteOrder(order.id)} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-600">Mark as Complete</button>;
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">{userRole === 'client' ? 'My Orders' : 'Manage Sales'}</h1>
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${activeTab === tab ? 'border-fiverr-green text-fiverr-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{tab}</button>
                ))}
            </nav>
        </div>

        {filteredOrders.length > 0 ? (
            <div className="space-y-6">
                {filteredOrders.map(order => (
                    <div key={order.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg transition-shadow hover:shadow-xl flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4 flex-grow">
                            <img className="w-24 h-16 rounded-lg object-cover flex-shrink-0" src={order.gigs?.cover_image} alt={order.gigs?.title} />
                            <div>
                                <p className="font-bold text-gray-800">{order.gigs?.title}</p>
                                <p className="text-sm text-gray-500">{userRole === 'client' ? `Seller: ${order.seller?.username}` : `Buyer: ${order.buyer?.username}`}</p>
                                <p className="font-bold text-lg text-gray-900 md:hidden mt-2">${order.price}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
                            <p className="font-bold text-lg text-gray-900 hidden md:block">${order.price}</p>
                            <div className="my-2 md:my-0"><StatusBadge status={order.status} /></div>
                            <div className="flex items-center space-x-4">
                                {renderStatusActions(order)}
                                <Link to={`/chat/${order.id}`} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-300">Message</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center bg-white p-12 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700">No Orders Found</h2>
                <p className="text-gray-500 mt-2">There are no orders with the status "{activeTab}".</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
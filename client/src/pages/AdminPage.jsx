// client/src/pages/AdminPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: usersData } = await supabase.from('users').select('*');
      const { data: gigsData } = await supabase.from('gigs').select('*, seller:seller_id(username)');
      const { data: ordersData } = await supabase.from('orders').select('*, buyer:buyer_id(username), gigs(title)');
      setUsers(usersData || []);
      setGigs(gigsData || []);
      setOrders(ordersData || []);
    } catch (error) { 
      console.error("Error fetching admin data:", error);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (error) alert("Error changing role: " + error.message);
    else {
      alert("User role updated successfully.");
      fetchData();
    }
  };
  
  const handleUserStatusChange = async (userId, newStatus) => {
    const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', userId);
    if (error) alert("Error changing status: " + error.message);
    else {
      alert("User status updated successfully.");
      fetchData();
    }
  };

  const handleArchiveGig = async (gigId) => {
    if (window.confirm("Are you sure you want to archive this gig?")) {
      const { error } = await supabase.from('gigs').update({ is_archived: true }).eq('id', gigId);
      if (error) alert("Error archiving gig: " + error.message);
      else {
        alert("Gig archived successfully.");
        fetchData();
      }
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) alert("Error changing order status: " + error.message);
    else {
        alert("Order status updated successfully.");
        fetchData();
    }
  };

  if (loading) return <p className="text-center p-8 bg-gray-100 min-h-screen">Loading Admin Dashboard...</p>;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('users')} className={`py-4 px-1 border-b-2 font-semibold ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Manage Users</button>
          <button onClick={() => setActiveTab('gigs')} className={`py-4 px-1 border-b-2 font-semibold ${activeTab === 'gigs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Manage Gigs</button>
          <button onClick={() => setActiveTab('orders')} className={`py-4 px-1 border-b-2 font-semibold ${activeTab === 'orders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Manage Orders</button>
        </nav>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Users ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead><tr className="bg-gray-50"><th className="py-2 px-4 text-left">Username</th><th className="py-2 px-4 text-left">Email</th><th className="py-2 px-4 text-left">Role</th><th className="py-2 px-4 text-left">Status</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">{user.username}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <select defaultValue={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="border rounded p-1 text-sm bg-gray-50">
                        <option value="client">Client</option><option value="freelancer">Freelancer</option><option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {user.status === 'active' ? 
                        <button onClick={() => handleUserStatusChange(user.id, 'banned')} className="text-sm text-red-500 hover:font-bold">Ban</button> :
                        <button onClick={() => handleUserStatusChange(user.id, 'active')} className="text-sm text-green-500 hover:font-bold">Unban</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'gigs' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Gigs ({gigs.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead><tr className="bg-gray-50"><th className="py-2 px-4 text-left">Title</th><th className="py-2 px-4 text-left">Seller</th><th className="py-2 px-4 text-left">Price</th><th className="py-2 px-4 text-left">Actions</th></tr></thead>
              <tbody>
                {gigs.map(gig => (
                  <tr key={gig.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold truncate max-w-sm">{gig.title}</td>
                    <td className="py-3 px-4 text-gray-600">{gig.seller?.username || 'N/A'}</td>
                    <td className="py-3 px-4 font-bold text-green-600">${gig.price}</td>
                    <td className="py-3 px-4 space-x-4 text-sm">
                      <Link to={`/gig/${gig.id}/edit`} className="text-blue-500 hover:font-bold">Edit</Link>
                      <button onClick={() => handleArchiveGig(gig.id)} className="text-orange-500 hover:font-bold">Archive</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Orders ({orders.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead><tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Gig Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Buyer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Price</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              </tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold truncate max-w-sm">{order.gigs?.title || 'Gig Not Found'}</td>
                    <td className="py-3 px-4 text-gray-600">{order.buyer?.username || 'N/A'}</td>
                    <td className="py-3 px-4 font-bold text-green-600">${order.price}</td>
                    <td className="py-3 px-4">
                      <select defaultValue={order.status} onChange={(e) => handleOrderStatusChange(order.id, e.target.value)} className="border rounded p-1 text-sm bg-gray-50">
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPage;
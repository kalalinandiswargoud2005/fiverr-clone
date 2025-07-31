// client/src/components/DashboardGate.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import FreelancerDashboard from '../pages/FreelancerDashboard';
import ClientDashboard from '../pages/ClientDashboard';

const DashboardGate = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (profile) setRole(profile.role);
      }
      setLoading(false);
    };
    getRole();
  }, []);

  if (loading) return <p className="text-center p-8">Loading...</p>;

  if (role === 'freelancer') return <FreelancerDashboard />;
  if (role === 'client') return <ClientDashboard />;
  
  return <p className="text-center p-8">Welcome! Select an option from the header.</p>; 
};

export default DashboardGate;
// client/src/components/AdminRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };
    checkAdminStatus();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Or a spinner component
  }

  return isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;
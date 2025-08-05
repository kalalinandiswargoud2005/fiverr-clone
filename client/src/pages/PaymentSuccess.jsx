// client/src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PaymentSuccess = () => {
  const location = useLocation();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const createOrder = async () => {
      const searchParams = new URLSearchParams(location.search);
      const gigId = searchParams.get('gig_id');

      if (gigId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("User not found.");

          const { data: gig } = await supabase.from('gigs').select('seller_id, price').eq('id', gigId).single();
          if (!gig) throw new Error("Gig not found.");

          const { error } = await supabase.from('orders').insert({
            gig_id: gigId,
            buyer_id: user.id,
            seller_id: gig.seller_id,
            price: gig.price,
            status: 'in_progress',
          });

          if (error) throw error;
          setStatus('success');
        } catch (err) {
          console.error("Error creating order:", err);
          setStatus('error');
        }
      }
    };
    createOrder();
  }, [location]);

  if (status === 'processing') return <p className="text-center p-8">Processing your order, please wait...</p>;
  if (status === 'error') return <p className="text-center p-8 text-red-500">There was an error creating your order. Please contact support.</p>;

  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold text-fiverr-green mb-4">Payment Successful!</h1>
      <p>Your order has been placed and the seller has been notified.</p>
      <Link to="/orders" className="mt-6 inline-block bg-fiverr-green text-white font-bold py-2 px-4 rounded">
        View Your Orders
      </Link>
    </div>
  );
};

export default PaymentSuccess;
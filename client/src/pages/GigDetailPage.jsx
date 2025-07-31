// client/src/pages/GigDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import placeholderImage from '../assets/placeholder.png';
import axios from 'axios';

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <svg
            key={starValue}
            className={`h-5 w-5 ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
};

const GigDetailPage = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchGigAndReviews = async () => {
      setLoading(true);
      try {
        const { data: gigData, error: gigError } = await supabase
          .from('gigs')
          .select(`*, users ( username, profile_image_url )`)
          .eq('id', gigId)
          .eq('is_archived', false)
          .single();

        if (gigError) throw gigError;
        setGig(gigData);

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`*, reviewer:users ( username, profile_image_url )`)
          .eq('gig_id', gigId);

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (gigId) {
      fetchGigAndReviews();
    }
  }, [gigId]);

  const handlePurchase = async () => {
    setPurchasing(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in to purchase a gig.");
        setPurchasing(false);
        return;
      }

      // ⚡ Optional: Stripe Checkout Integration
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8800';

      /*
      const response = await axios.post(`${apiUrl}/api/create-checkout-session`, {
        gigId: gig.id,
        buyerId: user.id,
      });
      window.location.href = response.data.url;
      return;
      */

      // 🚀 Default: Direct order creation without payment
      const { error: insertError } = await supabase.from('orders').insert({
        gig_id: gig.id,
        buyer_id: user.id,
        seller_id: gig.seller_id,
        price: gig.price,
        status: 'in_progress',
      });

      if (insertError) throw insertError;

      alert('Order created successfully!');
      navigate('/orders');
    } catch (err) {
      setError(err.message);
      console.error("Order creation error:", err);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <p className="text-center text-xl p-8">Loading gig details...</p>;
  if (error) return <p className="text-center text-red-500 p-8">Error: {error}</p>;
  if (!gig) return <p className="text-center text-xl p-8">Gig not found.</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{gig.title}</h1>
          <div className="flex items-center mb-6">
            <img src={gig.users?.profile_image_url || placeholderImage} alt={gig.users?.username} className="w-12 h-12 rounded-full mr-4 object-cover" />
            <span className="font-bold text-lg">{gig.users?.username || 'Seller'}</span>
          </div>

          <img src={gig.cover_image} alt={gig.title} className="w-full rounded-lg shadow-lg mb-8" />
          <h2 className="text-2xl font-bold mb-4">About This Gig</h2>
          <p className="text-gray-700 whitespace-pre-wrap mb-8">{gig.description}</p>

          {/* Reviews */}
          <div className="border-t pt-8">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="mb-6">
                  <div className="flex items-center mb-2">
                    <img
                      src={review.reviewer?.profile_image_url || placeholderImage}
                      alt={review.reviewer?.username}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                    <span className="font-semibold">{review.reviewer?.username || 'User'}</span>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-24">
            <div className="flex justify-between items-baseline mb-4">
              <h3 className="font-bold text-xl">{gig.category}</h3>
              <span className="text-2xl font-bold">${gig.price}</span>
            </div>
            <p className="text-gray-600 mb-6"><b>{gig.delivery_time} Days Delivery</b></p>
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full bg-fiverr-green text-white font-bold py-3 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {purchasing ? 'Processing...' : `Continue ($${gig.price})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetailPage;

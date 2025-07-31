// client/src/pages/LeaveReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Star = ({ filled, onClick }) => (
  <svg onClick={onClick} className={`h-8 w-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const LeaveReviewPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase.from('orders').select('*, gigs(*)').eq('id', orderId).single();
        if (error) throw error;
        setOrder(data);
      } catch (err) {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const { error: insertError } = await supabase.from('reviews').insert({
        order_id: order.id,
        gig_id: order.gigs.id,
        reviewer_id: user.id,
        rating: rating,
        comment: comment,
      });
      if (insertError) throw insertError;

      alert('Review submitted successfully!');
      navigate('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center p-8">Loading...</p>;
  if (error) return <p className="text-center p-8 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Leave a Review</h1>
      <p className="text-gray-600 mb-8">For: {order?.gigs.title}</p>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Your Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} filled={star <= rating} onClick={() => setRating(star)} />
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-lg font-medium text-gray-700">Your Comment</label>
          <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows="5" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-fiverr-green focus:border-fiverr-green"></textarea>
        </div>
        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-fiverr-green hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default LeaveReviewPage;
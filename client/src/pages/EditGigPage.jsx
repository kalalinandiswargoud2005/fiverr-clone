// client/src/pages/EditGigPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const EditGigPage = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the existing gig data to pre-fill the form
    const fetchGig = async () => {
      try {
        const { data, error } = await supabase.from('gigs').select('*').eq('id', gigId).single();
        if (error) throw error;
        setGig(data);
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
      } catch (err) {
        setError('Failed to fetch gig data.');
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [gigId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('gigs')
        .update({ title, description, price: parseFloat(price) })
        .eq('id', gigId);

      if (error) throw error;
      alert('Gig updated successfully!');
      navigate('/dashboard');
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
      <h1 className="text-3xl font-bold mb-8">Edit Your Gig</h1>
      <form onSubmit={handleUpdate} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Gig Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="5" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-skillora-green hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditGigPage;
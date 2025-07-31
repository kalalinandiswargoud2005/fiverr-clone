// client/src/pages/CreateGig.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const CreateGig = () => {
  const navigate = useNavigate();
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(5);
  const [category, setCategory] = useState('Graphics & Design');
  const [deliveryTime, setDeliveryTime] = useState(3);

  // Multi-image state
  const [images, setImages] = useState([]); // Will hold File objects or URL strings
  const [urlInput, setUrlInput] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 5) {
        setError("You can upload a maximum of 5 images.");
        return;
      }
      setImages(prev => [...prev, ...filesArray]);
    }
  };

  const handleAddUrl = () => {
    if (urlInput && images.length < 5) {
      setImages(prev => [...prev, urlInput]);
      setUrlInput('');
    } else if (images.length >= 5) {
        setError("You can upload a maximum of 5 images.");
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
        setError("Please add at least one image for your gig.");
        return;
    }
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in.');

      // Upload all file objects to storage and collect URLs
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          if (typeof image === 'string') {
            return image; // It's already a URL
          }
          // It's a File object, so upload it
          const fileName = `${user.id}/${Date.now()}_${image.name}`;
          await supabase.storage.from('gig-images').upload(fileName, image);
          const { data } = supabase.storage.from('gig-images').getPublicUrl(fileName);
          return data.publicUrl;
        })
      );

      const coverImage = imageUrls[0]; // First image is the cover
      const galleryImages = imageUrls.slice(1); // The rest are for the gallery

      // Insert the new gig into the database
      const { error: insertError } = await supabase.from('gigs').insert({
        seller_id: user.id,
        title,
        description,
        price: parseFloat(price),
        category,
        delivery_time: parseInt(deliveryTime),
        cover_image: coverImage,
        gallery_images: galleryImages,
      });

      if (insertError) throw insertError;

      alert('Gig created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Create Your Gig</h1>
        <p className="text-gray-600 mb-8">Showcase your service and attract buyers.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">1. Overview & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-600 mb-1">Gig Title</label>
                <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="I will create a modern minimalist logo..." className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border border-gray-300 bg-white rounded-lg">
                  <option>Graphics & Design</option><option>Digital Marketing</option><option>Writing & Translation</option><option>Video & Animation</option><option>Programming & Tech</option>
                </select>
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-600 mb-1">Price ($)</label>
                <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="5" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-semibold text-gray-600 mb-1">Delivery Time (days)</label>
                <input id="deliveryTime" type="number" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} required min="1" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="6" className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-700">2. Gallery Images</h2>
            <p className="text-sm text-gray-500 mb-6">Upload up to 5 images. The first image will be your cover.</p>

            {/* Image Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                {images.map((img, index) => (
                    <div key={index} className="relative group">
                        <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`preview ${index}`} className="w-full h-32 object-cover rounded-lg" />
                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                ))}
            </div>

            {images.length < 5 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload */}
                <div>
                  <label htmlFor="coverImage" className="block w-full text-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <span className="text-fiverr-green font-semibold">Click to Upload Files</span>
                    <input id="coverImage" type="file" multiple onChange={handleFileSelect} accept="image/*" className="hidden"/>
                  </label>
                </div>
                {/* URL Input */}
                <div className="flex">
                  <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Or paste an image URL" className="flex-grow p-3 border border-gray-300 rounded-l-lg" />
                  <button type="button" onClick={handleAddUrl} className="bg-gray-200 text-gray-700 font-semibold px-4 rounded-r-lg">Add</button>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-fiverr-green hover:bg-green-700 disabled:opacity-50 transition-all transform hover:scale-105">
              {loading ? 'Creating Gig...' : 'Save & Publish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGig;
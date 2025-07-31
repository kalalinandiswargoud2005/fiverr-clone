// client/src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import placeholderImage from '../assets/placeholder.png';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFullName(data.full_name || '');
      setDob(data.dob || '');
      setAvatarPreview(data.profile_image_url || placeholderImage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      let avatarUrl = profile.profile_image_url;
      if (avatarFile) {
        const fileName = `${user.id}-${Date.now()}`;
        await supabase.storage.from('avatars').upload(fileName, avatarFile); // Assuming you have a public bucket named 'avatars'
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('users').update({
        full_name: fullName,
        dob: dob,
        profile_image_url: avatarUrl,
      }).eq('id', user.id);

      if (error) throw error;
      alert('Profile updated successfully!');
      fetchProfile(); // Refetch to show updated data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center p-8">Loading profile...</p>;
  if (error) return <p className="text-center p-8 text-red-500">{error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Profile</h1>
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <img src={avatarPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
              <input type="file" id="avatar" onChange={handleAvatarChange} accept="image/*" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-fiverr-green hover:file:bg-green-100" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
              <p className="p-3 bg-gray-100 rounded-lg">{profile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
              <p className="p-3 bg-gray-100 rounded-lg">{profile.username}</p>
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
              <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fiverr-green" />
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-semibold text-gray-600 mb-1">Date of Birth</label>
              <input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fiverr-green" />
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-fiverr-green hover:bg-green-700 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
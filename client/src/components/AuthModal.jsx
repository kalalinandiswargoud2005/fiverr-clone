// client/src/components/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Eye icon SVG for the password toggle
const EyeIcon = ({ ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Component accepts props to control its initial state
const AuthModal = ({ show, onClose, initialMode = 'login', initialRole = 'client' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Effect to reset the form when it opens or its initial props change
  useEffect(() => {
    setMode(initialMode);
    setRole(initialRole);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setShowPassword(false);
  }, [initialMode, initialRole, show]);

  if (!show) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        const { error: profileError } = await supabase.from('users').insert({ id: authData.user.id, username, email, role });
        if (profileError) throw profileError;
        
        alert('Registration successful! You are now logged in.');
        onClose();

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-center mb-6">{mode === 'login' ? 'Sign In to Skillora' : 'Join Skillora'}</h2>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            <EyeIcon onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 h-5 w-5 text-gray-400 cursor-pointer"/>
          </div>
          {mode === 'register' && (
            <>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                <EyeIcon onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 h-5 w-5 text-gray-400 cursor-pointer"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">I want to...</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  disabled={initialRole === 'freelancer'}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm disabled:bg-gray-100"
                >
                  <option value="client">Buy freelance services</option>
                  <option value="freelancer">Sell freelance services</option>
                </select>
              </div>
            </>
          )}
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-skillora-green hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Processing...' : (mode === 'login' ? 'Continue' : 'Join')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === 'login' ? "Not a member yet?" : "Already a member?"}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-medium text-skillora-green hover:underline">
            {mode === 'login' ? 'Join Now' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
// client/src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AuthModal from './AuthModal';
import placeholderImage from '../assets/placeholder.png';

const fiverrProLinks = [
  { name: "Pro Logo Design", path: "#" },
  { name: "Pro SEO Services", path: "#" },
  { name: "Pro Video Editing", path: "#" },
  { name: "Pro Web Development", path: "#" },
  { name: "Pro Mobile App Development", path: "#" },
  { name: "Pro Business Consulting", path: "#" },
  { name: "Pro Financial Consulting", path: "#" },
  { name: "Pro Legal Consulting", path: "#" },
  { name: "Pro Content Strategy", path: "#" },
  { name: "Pro Brand Voice & Tone", path: "#" },
];

const exploreLinks = [
  { name: "Discover Services", path: "#" },
  { name: "Community Hub", path: "#" },
  { name: "Fiverr Forum", path: "#" },
  { name: "Guides & Tutorials", path: "#" },
  { name: "Official Blog", path: "#" },
  { name: "Podcast", path: "#" },
  { name: "Learn from Fiverr", path: "#" },
  { name: "Logo Maker", path: "#" },
  { name: "Affiliate Program", path: "#" },
  { name: "Events & Webinars", path: "#" },
];

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ mode: 'login', role: 'client' });
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async (userId) => {
      const { data } = await supabase.from('users').select('role, profile_image_url').eq('id', userId).single();
      setProfile(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setProfile(null);
      if (session) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setActiveDropdown(null); };
  const openModal = (mode, role = 'client') => {
    setModalConfig({ mode, role });
    setShowModal(true);
  };
  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (headerSearchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(headerSearchTerm.trim())}`);
    }
  };

  const renderNavLinks = () => {
    const isLoggedIn = session && profile;
    return (
      <>
        <div className="relative" onMouseEnter={() => setActiveDropdown('pro')} onMouseLeave={() => setActiveDropdown(null)}>
          <button className="flex items-center hover:text-fiverr-green">Fiverr Pro</button>
          {activeDropdown === 'pro' && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-30">
              {fiverrProLinks.map(link => ( <Link key={link.name} to={link.path} className="block px-4 py-2 text-sm text-gray-700 font-normal hover:bg-gray-100">{link.name}</Link> ))}
            </div>
          )}
        </div>
        <div className="relative" onMouseEnter={() => setActiveDropdown('explore')} onMouseLeave={() => setActiveDropdown(null)}>
          <button className="flex items-center hover:text-fiverr-green">Explore</button>
          {activeDropdown === 'explore' && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-30">
              {exploreLinks.map(link => ( <Link key={link.name} to={link.path} className="block px-4 py-2 text-sm text-gray-700 font-normal hover:bg-gray-100">{link.name}</Link>))}
            </div>
          )}
        </div>

        {!isLoggedIn ? (
          <>
            <button onClick={() => openModal('register', 'freelancer')} className="hover:text-fiverr-green whitespace-nowrap">Become a Seller</button>
            <button onClick={() => openModal('login')} className="hover:text-fiverr-green">Sign In</button>
            <button onClick={() => openModal('register')} className="px-4 py-2 rounded border border-gray-400 hover:bg-fiverr-green hover:text-white hover:border-fiverr-green transition-colors">Join</button>
          </>
        ) : (
          <>
            {profile.role === 'admin' && (
              <Link to="/admin" className="font-semibold text-red-500 hover:text-red-700">Admin</Link>
            )}
            <Link to="/orders" className="hover:text-fiverr-green">Orders</Link>
            <div className="relative">
              <button onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')} className="w-10 h-10 rounded-full overflow-hidden border-2 hover:border-fiverr-green">
                <img src={profile?.profile_image_url || placeholderImage} alt="Profile" className="w-full h-full object-cover" />
              </button>
              {activeDropdown === 'profile' && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30">
                  <Link to="/profile" onClick={() => setActiveDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-normal">Profile</Link>
                  <Link to="/dashboard" onClick={() => setActiveDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-normal">Dashboard</Link>
                  <div className="border-t my-1"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 font-normal">Logout</button>
                </div>
              )}
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-20 bg-white text-gray-800 shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center flex-grow">
            <Link to="/" className="text-3xl font-bold">fiverr<span className="text-fiverr-green">.</span></Link>
            <form onSubmit={handleHeaderSearch} className="hidden lg:flex items-center ml-8 w-full max-w-lg">
              <input type="text" placeholder="What service are you looking for today?" value={headerSearchTerm} onChange={(e) => setHeaderSearchTerm(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-l-md" />
              <button type="submit" className="bg-gray-800 text-white p-2.5 rounded-r-md hover:bg-black"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" /></svg></button>
            </form>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-bold">
            {renderNavLinks()}
          </nav>
        </div>
      </header>
      <AuthModal show={showModal} onClose={() => setShowModal(false)} initialMode={modalConfig.mode} initialRole={modalConfig.role} />
    </>
  );
};

export default Header;
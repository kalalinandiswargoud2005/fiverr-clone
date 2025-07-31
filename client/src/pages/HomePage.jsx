// client/src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import GigCard from '../components/GigCard';
import SkeletonCard from '../components/SkeletonCard';
import proImage from '../assets/fiverr-pro.jpg';
import webDevImage from '../assets/popular/website-dev.jpg';
import videoEditImage from '../assets/popular/video-editing.jpg';
import seoImage from '../assets/popular/seo.jpg';
import uiuxImage from '../assets/popular/ui-ux.jpg';
import mobileAppImage from '../assets/popular/mobile-app.jpg';
import contentWritingImage from '../assets/popular/content-writing.jpg';


const categoriesData = [
  { name: "Programming & Tech", icon: "💻" },
  { name: "Graphics & Design", icon: "🎨" },
  { name: "Digital Marketing", icon: "📈" },
  { name: "Writing & Translation", icon: "✍️" },
  { name: "Video & Animation", icon: "🎬" },
];

const popularServicesData = [
  { name: "Website Development", image: webDevImage },
  { name: "Video Editing", image: videoEditImage },
  { name: "SEO", image: seoImage },
  { name: "UI/UX Design", image: uiuxImage },
  { name: "Mobile App Development", image: mobileAppImage },
  { name: "Content Writing", image: contentWritingImage },
];


const HomePage = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const fetchGigs = useCallback(async (currentSearchTerm, currentCategory) => {
    try {
      setLoading(true);
      let query = supabase.from('gigs').select('*, reviews(rating)').eq('is_archived', false);
      if (currentCategory) query = query.eq('category', currentCategory);
      if (currentSearchTerm) query = query.ilike('title', `%${currentSearchTerm}%`);

      const { data, error } = await query;
      if (error) throw error;
      setGigs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryTerm = params.get('search') || '';
    const categoryTerm = params.get('category') || null;
    setSearchTerm(queryTerm);
    fetchGigs(queryTerm, categoryTerm);
  }, [location.search, fetchGigs]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    params.set('search', searchTerm);
    navigate(`/?${params.toString()}`);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: direction * 300, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} />

      <div className="bg-gray-100 py-4">
        <div className="container mx-auto flex justify-center items-center space-x-8 text-gray-500 font-bold">
          <span>Trusted by:</span><span>Meta</span><span>Google</span><span>NETFLIX</span><span>P&G</span>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center overflow-x-auto">
          {categoriesData.map(category => (
            <Link key={category.name} to={`/?category=${encodeURIComponent(category.name)}`} className="flex flex-col items-center space-y-2 text-gray-600 hover:text-fiverr-green p-4">
              <span className="text-4xl">{category.icon}</span>
              <span className="font-semibold whitespace-nowrap">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-8">Popular services</h2>
          <div className="relative">
            <div ref={scrollContainerRef} className="flex space-x-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {popularServicesData.map(service => (
                <Link key={service.name} to={`/?search=${encodeURIComponent(service.name)}`} className="flex-shrink-0 w-64 h-80 rounded-lg relative overflow-hidden group">
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 left-4 text-white"><p className="font-bold text-2xl">{service.name}</p></div>
                </Link>
              ))}
            </div>
            <button onClick={() => scroll(1)} className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10 hidden md:block">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4">fiverr. pro</h2>
            <p className="text-xl mb-6 opacity-90">Access top-tier, vetted freelancers for your most critical projects.</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center"><svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span className="font-semibold">Vetted Professional Talent</span></li>
              <li className="flex items-center"><svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span className="font-semibold">Dedicated Support</span></li>
              <li className="flex items-center"><svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span className="font-semibold">Collaboration Tools</span></li>
            </ul>
            <Link to="#" className="bg-white text-gray-900 font-bold py-3 px-6 rounded hover:bg-gray-200">Explore Fiverr Pro</Link>
          </div>
          <div><img src={proImage} alt="Fiverr Pro" className="rounded-lg shadow-2xl" /></div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">All Services</h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : gigs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {gigs.map(gig => {
              const reviewCount = gig.reviews.length;
              const avgRating = reviewCount > 0 
                ? (gig.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
                : 0;
              return <GigCard key={gig.id} gig={gig} reviewCount={reviewCount} avgRating={avgRating} />
            })}
          </div>
        ) : (
          <div className="text-center p-16 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">No Gigs Found</h2>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;
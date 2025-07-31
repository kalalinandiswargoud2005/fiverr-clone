// client/src/components/Hero.jsx
import React from 'react';
import heroVideo from '../assets/hero-video.mp4';

const Hero = ({ searchTerm, setSearchTerm, handleSearch }) => {
  const popularTags = ["website development", "architecture & interior design", "UGC videos", "video editing", "vibe coding"];

  return (
    <div className="h-[600px] relative text-white flex items-center justify-center overflow-hidden">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto z-0 -translate-x-1/2 -translate-y-1/2"
      >
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-black/60 z-10"></div>

      <div className="container mx-auto px-6 z-20 relative">
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          Our freelancers <br /> will take it from here
        </h1>
        <form onSubmit={handleSearch} className="flex mb-4 max-w-2xl">
          <input
            type="text"
            placeholder="Search for any service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 border-none rounded-l-md text-gray-800 focus:outline-none"
          />
          <button type="submit" className="bg-fiverr-green text-white px-8 font-bold rounded-r-md hover:bg-green-700">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              {/* FIXED: Corrected the typo in the path data (3:476 -> 3.476) */}
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
        <div className="flex items-center space-x-4">
          <span className="font-bold">Popular:</span>
          {popularTags.map(tag => (
            <button 
              key={tag} 
              onClick={() => setSearchTerm(tag)}
              className="border border-white rounded-full px-3 py-1 text-sm hover:bg-white hover:text-black transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
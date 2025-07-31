// client/src/components/GigCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import placeholderImage from '../assets/placeholder.png';

const GigCard = ({ gig, reviewCount, avgRating }) => {
  return (
    <Link to={`/gig/${gig.id}`} className="block border rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-200 overflow-hidden bg-white">
      <img 
        src={gig.cover_image || placeholderImage} 
        alt={gig.title} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate mb-2 h-12">{gig.title}</h3>
        {reviewCount > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-bold text-yellow-500">{avgRating}</span>
            <span className="ml-1">({reviewCount})</span>
          </div>
        )}
      </div>
      <div className="p-4 border-t flex justify-end items-center text-xs text-gray-500 font-bold uppercase">
        <span>Starting At</span>
        <span className="text-lg font-semibold text-gray-700 ml-2">${gig.price}</span>
      </div>
    </Link>
  );
};
export default GigCard;
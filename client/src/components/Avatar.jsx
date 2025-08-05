// client/src/components/Avatar.jsx
import React from 'react';

const Avatar = ({ username, className }) => {
  const initial = username ? username[0].toUpperCase() : '?';

  // Simple hash function to get a consistent color based on username
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 
    'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
  ];
  const colorIndex = username ? username.charCodeAt(0) % colors.length : 0;
  const bgColor = colors[colorIndex];

  return (
    <div className={`flex items-center justify-center rounded-full text-white font-bold ${bgColor} ${className}`}>
      {initial}
    </div>
  );
};

export default Avatar;
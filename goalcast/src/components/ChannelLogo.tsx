'use client';

import React, { useState } from 'react';
import { Tv2 } from 'lucide-react';

interface ChannelLogoProps {
  src: string;
  alt: string;
  className?: string;
  channelName?: string;
}

/**
 * Client Component for rendering a channel's logo image.
 * Safely handles event handlers like `onError` within a client boundary.
 * Renders a beautiful fallback if the logo is missing or broken.
 */
export default function ChannelLogo({ src, alt, className = '', channelName = '' }: ChannelLogoProps) {
  const [hasError, setHasError] = useState(!src);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    // Generate initials from channel name (e.g. "ESPN Argentina" -> "EA")
    const initials = channelName
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'TV';
      
    // Generate a consistent color based on the name
    const colors = [
      'bg-red-500', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    const colorIndex = channelName ? channelName.charCodeAt(0) % colors.length : 1;
    const colorClass = colors[colorIndex];

    return (
      <div className={`flex items-center justify-center rounded-xl text-white font-bold tracking-wider shadow-inner ${colorClass} ${className}`}>
        {initials.length > 0 ? initials : <Tv2 className="w-1/2 h-1/2 opacity-80" />}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}

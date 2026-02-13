"use client";

import Image from 'next/image';
import { useState } from 'react';
import { normalizeImagePath } from '@/lib/utils';

interface HairstylistBannerProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function HairstylistBanner({ 
  src, 
  alt, 
  className = '', 
  priority = false 
}: HairstylistBannerProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const normalizedSrc = normalizeImagePath(src);

  const handleImageError = () => {
    console.error('Failed to load banner image:', src);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Show placeholder if image fails to load or no source
  if (imageError || !src) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <svg 
            className="w-16 h-16 text-gray-400 mx-auto mb-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-sm text-gray-600 font-medium">Portfolio Banner</p>
          <p className="text-xs text-gray-500 mt-1">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
      
      {/* Main image */}
      <Image
        src={normalizedSrc}
        alt={alt}
        fill
        className={`object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        priority={priority}
        unoptimized={normalizedSrc.startsWith('/api/files/')}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

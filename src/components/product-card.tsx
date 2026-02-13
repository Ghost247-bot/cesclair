"use client";

import Link from 'next/link';
import Image from 'next/image';
import { normalizeImagePath } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  colors?: number;
  href: string;
  originalPrice?: number;
  isOnSale?: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  colors, 
  href,
  originalPrice,
  isOnSale,
  stock,
  rating,
  reviewCount
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const discountPercentage = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleImageLoad = () => {
    setImgLoading(false);
  };

  const handleImageError = () => {
    setImgError(true);
    setImgLoading(false);
  };

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-3 rounded-lg">
        {/* Loading skeleton */}
        {imgLoading && !imgError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {/* Product image */}
        {!imgError ? (
          <Image
            src={normalizeImagePath(image)}
            alt={name}
            fill
            className={`object-contain transition-all duration-300 group-hover:scale-105 ${
              imgLoading ? 'opacity-0' : 'opacity-100'
            }`}
            unoptimized
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full mb-2 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 text-center">{name}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOnSale && discountPercentage > 0 && (
            <div className="bg-black text-white px-2 py-1 text-xs font-medium rounded">
              {discountPercentage}% OFF
            </div>
          )}
          {stock === 0 && (
            <div className="bg-red-600 text-white px-2 py-1 text-xs font-medium rounded">
              Out of Stock
            </div>
          )}
          {stock !== undefined && stock > 0 && stock <= 5 && (
            <div className="bg-orange-600 text-white px-2 py-1 text-xs font-medium rounded">
              Only {stock} left
            </div>
          )}
        </div>
      </div>

      {/* Product info */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 leading-tight">
          {name}
        </h3>
        
        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {reviewCount && (
              <span className="text-xs text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">${price.toFixed(2)}</p>
          {originalPrice && originalPrice > price && (
            <p className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</p>
          )}
        </div>
        
        {/* Colors indicator */}
        {colors && colors > 1 && (
          <p className="text-xs text-gray-500">{colors} colors available</p>
        )}
      </div>
    </Link>
  );
}

"use client";

import Image from 'next/image';
import Link from 'next/link';
import { normalizeImagePath } from '@/lib/utils';
import { useState } from 'react';

const SplitFeatureSweaters = () => {
  const [imgError, setImgError] = useState(false);
  const imageSrc = normalizeImagePath("https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-ceslane-com/assets/images/53a91526_0f42-9.jpg");
  
  return (
    <section className="flex flex-col md:block md:relative md:aspect-[4/5]">
      {/* Container for image and its overlay */}
      <div className="relative aspect-[4/5] md:absolute md:inset-0">
        {!imgError ? (
          <>
            <Image
              src={imageSrc}
              alt="A woman wearing a burgundy sweater over a collared shirt."
              fill
              className="z-0 object-cover"
              priority
              unoptimized
              onError={(e) => {
                console.error('Image failed to load:', imageSrc);
                setImgError(true);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center z-0">
            <div className="text-center text-gray-500">
              <p className="text-sm">Image unavailable</p>
            </div>
          </div>
        )}
        {/* Desktop-only overlay */}
        <div className="hidden md:block absolute inset-0 bg-black/15 z-10"></div>
      </div>

      {/* Content Block */}
      <div className="bg-white text-center py-6 px-4 sm:py-8 sm:px-6 md:bg-transparent md:text-left md:absolute md:inset-0 md:z-20 md:p-8 md:flex md:flex-col md:items-start md:justify-start">
        <h2 className="text-xl sm:text-2xl font-medium uppercase text-primary-text md:text-white">
          THE SWEATER SHOP
        </h2>
        <p className="mt-2 text-sm sm:text-base text-secondary-text md:text-white">
          Premium styles made to last.
        </p>
        <Link
          href="/collections/sweater-shop"
          className="mt-3 sm:mt-4 inline-block border px-5 sm:px-6 py-2 sm:py-2.5 text-xs font-medium uppercase tracking-wider transition-colors text-primary-text border-primary-text hover:bg-gray-100 md:text-white md:border-white md:hover:bg-white/10"
        >
          SHOP NOW
        </Link>
      </div>
    </section>
  );
};

export default SplitFeatureSweaters;
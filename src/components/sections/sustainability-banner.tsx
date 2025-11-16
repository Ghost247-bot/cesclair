"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';
import { normalizeImagePath } from '@/lib/utils';

const SustainabilityBanner = () => {
  const [imgError, setImgError] = useState(false);
  const backgroundImageUrl = normalizeImagePath("https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-ceslane-com/assets/images/68ee3c4b_56f2-15.jpg");

  return (
    <section
      className="relative w-full bg-cover bg-center overflow-hidden"
      aria-labelledby="sustainability-heading"
    >
      {!imgError ? (
        <Image
          src={backgroundImageUrl}
          alt="Sustainability banner background"
          fill
          className="object-cover z-0"
          quality={85}
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 z-0" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40 z-10" />
      <div className="relative z-20 mx-auto flex max-w-[1440px] flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-12 sm:py-[60px] md:py-[80px] lg:py-[120px] text-center text-white">
        <h2
          id="sustainability-heading"
          className="font-medium uppercase tracking-tight text-xl sm:text-2xl md:text-[38px] md:leading-[1.15] lg:text-[52px] lg:leading-[1.1] leading-[1.2]"
        >
          Sustainability Looks Better With Receipts.
          <br />
          Here's Ours.
        </h2>
        <Link
          href="/sustainability"
          className="mt-4 sm:mt-6 block text-sm sm:text-base uppercase underline tracking-[0.05em] transition-all duration-200 hover:tracking-[0.08em]"
        >
          Read Our Latest Impact Report
        </Link>
      </div>
    </section>
  );
};

export default SustainabilityBanner;
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { normalizeImagePath } from "@/lib/utils";
import { useState } from "react";

// For the italic script font, 'Playfair Display' is used as a substitute for the original.
// This font should ideally be imported in the root layout file. For example:
// @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&display=swap');

const HeroSection = () => {
  const [imgError, setImgError] = useState(false);
  const imageSrc = normalizeImagePath("https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/287f132e_bc45-2.jpg");
  
  return (
    <section className="relative w-full aspect-[4/5] md:aspect-video overflow-hidden bg-secondary">
      {!imgError ? (
        <Image
          src={imageSrc}
          alt="A folded knit sweater in blue and brown tones"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 p-4">
        <div
          className="text-center text-white"
          style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)" }}
        >
          <h1 className="font-medium text-[36px] leading-tight md:text-[48px] lg:text-[72px] lg:leading-[0.9]">
            <span
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="block font-normal italic leading-none"
            >
              The
            </span>
            <span className="mt-2 block font-medium uppercase tracking-wider">
              BETTER
            </span>
            <span className="block font-medium uppercase tracking-wider">
              GIFTS
            </span>
          </h1>
          <p className="mt-4 text-base">Gifting you can feel good about.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/women/new-arrivals"
              className="flex w-full sm:w-auto items-center justify-center rounded-[2px] border border-white bg-transparent px-8 py-3 text-[13px] font-medium uppercase tracking-wider text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              Shop Now
              <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
            <Link
              href="/collections/gift-guide"
              className="flex w-full sm:w-auto items-center justify-center rounded-[2px] border border-white bg-transparent px-8 py-3 text-[13px] font-medium uppercase tracking-wider text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              Explore the Gift Guide
              <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
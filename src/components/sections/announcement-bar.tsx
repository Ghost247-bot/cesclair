"use client";

import { useState, useEffect, useCallback, FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LinkArrow: FC = () => (
  <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.44 0.025L9 3.593L5.44 7.161L4.66 6.378L7.008 4.3H0V3.097H7.008L4.66 0.807L5.44 0.025Z" fill="currentColor" />
  </svg>
);

const slides = [
  {
    id: 1,
    desktopText: "BLACK FRIDAY PREVIEW: 30% Off Our Favorites",
    mobileText: "30% Off Our Favorites",
    links: [
      { href: "/women/new-arrivals", desktopText: "Shop Women", mobileText: "Shop Women" },
      { href: "/men/new-arrivals", desktopText: "Shop Men", mobileText: "Shop Men" },
    ],
  },
  {
    id: 2,
    desktopText: "Receive 20% off your first order.",
    mobileText: "Receive 20% off your first order.",
    links: [
      { href: "/pages/email-signup", desktopText: "Sign Up For Emails", mobileText: "Sign Up" },
    ],
  },
  {
    id: 3,
    desktopText: "Enjoy free shipping on U.S. orders over $125.",
    mobileText: "Free shipping on U.S. orders over $125.",
    links: [],
  },
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 3000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  return (
    <div className="bg-[#c8c0b8] text-[#0a0a0a]">
      <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-between px-6 md:px-8">
        <div className="flex-grow">
          <div className="relative group w-full">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {slides.map((slide) => (
                  <div key={slide.id} className="min-w-full flex-shrink-0 px-8">
                    <div className="flex h-10 items-center justify-center text-center text-[13px] font-medium uppercase tracking-[0.05em]">
                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                        <div>
                          <span className="hidden md:inline">{slide.desktopText}</span>
                          <span className="md:hidden">{slide.mobileText}</span>
                        </div>
                        {slide.links.map((link, index) => (
                          <a key={index} href={link.href} className="flex items-center gap-2 hover:underline">
                            <LinkArrow />
                            <span>
                              <span className="hidden md:inline">{link.desktopText}</span>
                              <span className="md:hidden">{link.mobileText}</span>
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={prevSlide}
              aria-label="Previous announcement"
              className="absolute left-0 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={nextSlide}
              aria-label="Next announcement"
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="localization-wrapper hidden lg:block"></div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
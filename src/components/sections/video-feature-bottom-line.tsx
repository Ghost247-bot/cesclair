"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX } from 'lucide-react';

type FeatureCardProps = {
  title: string;
  description: string;
  linkHref: string;
  media: {
    type: 'image' | 'video';
    src: string;
    alt: string;
  };
};

const FeatureCard = ({ title, description, linkHref, media }: FeatureCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  useEffect(() => {
    if (media.type === 'video' && videoRef.current) {
      videoRef.current.muted = true;
    }
  }, [media.type]);

  return (
    <div className="relative text-white overflow-hidden aspect-[4/5] md:aspect-square">
      {media.type === 'video' ? (
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          src={media.src}
          autoPlay
          loop
          muted
          playsInline
          aria-label={media.alt}
        />
      ) : (
        <div className="w-full h-full bg-secondary" role="img" aria-label={media.alt}></div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-50% to-transparent" />

      <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end items-start">
        <h2 className="font-medium text-2xl sm:text-3xl md:text-[36px] lg:text-[48px] uppercase leading-none -tracking-[0.01em]">
          {title}
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base font-normal">
          {description}
        </p>
        <Link href={linkHref} className="mt-4 sm:mt-6 inline-block bg-transparent border border-white text-white uppercase text-xs sm:text-[13px] font-medium tracking-[0.05em] py-2.5 sm:py-3.5 px-6 sm:px-[30px] hover:bg-white/10 transition-colors">
          Shop Now
        </Link>
      </div>

      {media.type === 'video' && (
        <button
          onClick={toggleMute}
          className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10 text-white p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}
    </div>
  );
};

const VideoFeatureBottomLine = () => {
  const features = [
    {
      title: 'THE SWEATER SHOP',
      description: 'Premium styles made to last.',
      linkHref: '/collections/sweater-shop',
      media: {
        type: 'image' as const,
        src: '',
        alt: 'A model wearing a premium sweater.',
      },
    },
    {
      title: 'BOTTOM LINE',
      description: 'Pants with range from cozy to business casual.',
      linkHref: '/women/pants',
      media: {
        type: 'video' as const,
        src: 'https://www.everlane.com/cdn/shop/videos/c/vp/3d1a299d726c40c9a897fdd7c9005473/3d1a299d726c40c9a897fdd7c9005473.HD-1080p-7.2Mbps-61356966.mp4?v=0',
        alt: 'A woman posing in black crop top and high-waisted black pants.',
      },
    },
  ];

  return (
    <section className="bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
};

export default VideoFeatureBottomLine;
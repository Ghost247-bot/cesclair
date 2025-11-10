"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const mediaVariants = {
    hidden: { scale: 1.15, opacity: 0, filter: "blur(8px)" },
    visible: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    hover: {
      scale: 1.08,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.5
      }
    },
    hover: {
      opacity: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  const contentVariants = {
    hidden: { y: 40, opacity: 0, x: 50 },
    visible: {
      y: 0,
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.4
      }
    }
  };

  const titleVariants = {
    hidden: { 
      y: 25, 
      opacity: 0,
      clipPath: "inset(0 100% 0 0)",
      scale: 0.9
    },
    visible: {
      y: 0,
      opacity: 1,
      clipPath: "inset(0 0% 0 0)",
      scale: 1,
      transition: {
        duration: 0.9,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.6
      }
    }
  };

  const descriptionVariants = {
    hidden: { 
      y: 20, 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.8
      }
    }
  };

  const buttonVariants = {
    hidden: { 
      y: 25, 
      opacity: 0,
      scale: 0.9,
      x: 20
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 1
      }
    },
    hover: {
      scale: 1.08,
      x: -3,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="relative text-white overflow-hidden aspect-[4/5] md:aspect-square group"
    >
      <motion.div
        variants={mediaVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        whileHover="hover"
        className="absolute inset-0"
      >
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
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" role="img" aria-label={media.alt}></div>
        )}
      </motion.div>
      
      <motion.div
        variants={overlayVariants}
        whileHover="hover"
        className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-50% to-transparent"
      />

      <motion.div
        variants={contentVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end items-start"
      >
        <motion.h2 
          variants={titleVariants}
          className="font-medium text-2xl sm:text-3xl md:text-[36px] lg:text-[48px] uppercase leading-none -tracking-[0.01em]"
          style={{
            textShadow: "0 2px 15px rgba(0, 0, 0, 0.5)"
          }}
        >
          {title}
        </motion.h2>
        <motion.p 
          variants={descriptionVariants}
          className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg font-normal leading-relaxed"
          style={{
            textShadow: "0 1px 8px rgba(0, 0, 0, 0.4)"
          }}
        >
          {description}
        </motion.p>
        <motion.div 
          variants={buttonVariants} 
          whileHover="hover"
          className="mt-4 sm:mt-6"
        >
          <Link 
            href={linkHref} 
            className="group inline-flex items-center gap-2 bg-transparent border-2 border-white text-white uppercase text-xs sm:text-[13px] font-medium tracking-[0.05em] py-2.5 sm:py-3.5 px-6 sm:px-[30px] hover:bg-white/20 transition-all duration-300"
          >
            <span>Shop Now</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>

      {media.type === 'video' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.6, 
            delay: 1.2,
            type: "spring",
            stiffness: 200
          }}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMute}
          className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10 text-white p-2 rounded-full bg-black/30 border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all backdrop-blur-sm"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </motion.button>
      )}
    </motion.div>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section className="bg-background">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2"
      >
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </motion.div>
    </section>
  );
};

export default VideoFeatureBottomLine;
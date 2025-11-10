"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const VideoFeatureHome = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      const currentMuted = !videoRef.current.muted;
      videoRef.current.muted = currentMuted;
      setIsMuted(currentMuted);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const textVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const buttonVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  const videoVariants = {
    hidden: { scale: 1.05, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-secondary">
      {/* Aspect ratio container forces the correct height */}
      <motion.div 
        variants={videoVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="w-full aspect-[16/9]"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover bg-secondary"
          playsInline
          autoPlay
          loop
          muted
          onError={(e) => {
            // Handle video load errors gracefully
            console.warn('Video failed to load, using fallback');
            const video = e.target as HTMLVideoElement;
            if (video) {
              video.style.display = 'none';
            }
          }}
        >
          <source
            src="https://www.everlane.com/cdn/shop/videos/c/vp/5babf13ddcd84b3d94b0fbffca621736/5babf13ddcd84b3d94b0fbffca621736.HD-1080p-7.2Mbps-61356965.mp4?v=0"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Fallback gradient background if video fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -z-10" />
      </motion.div>

      {/* Gradient Overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent to-[60%]"></div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container px-4 sm:px-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-white w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
          >
            <motion.p 
              variants={textVariants}
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-normal"
            >
              THE HOLIDAY EDIT 001
            </motion.p>
            <motion.h2 
              variants={textVariants}
              className="mt-3 sm:mt-4 font-bold text-2xl sm:text-[28px] md:text-4xl lg:text-[48px] leading-[1.2]"
            >
              DESTINATION HOME
            </motion.h2>
            <motion.p 
              variants={textVariants}
              className="mt-3 sm:mt-4 text-sm sm:text-base font-normal leading-[1.6]"
            >
              Elevated looks for when life is on airplane mode.
            </motion.p>
            <motion.div 
              variants={containerVariants}
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start gap-3 sm:gap-4"
            >
              <motion.div variants={buttonVariants} whileHover="hover">
                <Link
                  href="/women/new-arrivals"
                  className="w-full sm:w-auto text-center border border-white bg-transparent py-3 sm:py-4 px-6 sm:px-8 text-white text-xs sm:text-button-primary transition-colors duration-300 hover:bg-white hover:text-primary"
                >
                  SHOP NEW
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover">
                <Link
                  href="/collections/holiday-edit"
                  className="w-full sm:w-auto text-center border border-white bg-transparent py-3 sm:py-4 px-6 sm:px-8 text-white text-xs sm:text-button-primary transition-colors duration-300 hover:bg-white hover:text-primary"
                >
                  EXPLORE LOOKBOOK
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mute/Unmute Control */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.8 }}
        whileHover={{ scale: 1.1 }}
        className="absolute bottom-4 right-4 md:bottom-8 md:right-8"
      >
        <button
          onClick={toggleMute}
          className="p-2 rounded-full border border-white/50 text-white hover:bg-white/10 transition-all"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <VolumeX size={20} strokeWidth={1.5} />
          ) : (
            <Volume2 size={20} strokeWidth={1.5} />
          )}
        </button>
      </motion.div>
    </section>
  );
};

export default VideoFeatureHome;
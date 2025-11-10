"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// For the italic script font, 'Playfair Display' is used as a substitute for the original.
// This font should ideally be imported in the root layout file. For example:
// @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&display=swap');

const HeroSection = () => {
  // Animation variants
  const imageVariants = {
    initial: { scale: 1.1, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 1.2, 
        ease: [0.25, 0.1, 0.25, 1] 
      }
    }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        delay: 0.3
      }
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4
      }
    }
  };

  const textVariants = {
    initial: { y: 30, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const buttonVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
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

  return (
    <section className="relative w-full aspect-[4/5] md:aspect-video overflow-hidden">
      {/* Animated Background Image */}
      <motion.div
        variants={imageVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0"
      >
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/287f132e_bc45-2.jpg"
          alt="A folded knit sweater in blue and brown tones"
          fill
          className="object-cover object-center"
          priority
        />
      </motion.div>

      {/* Animated Overlay */}
      <motion.div
        variants={overlayVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0 bg-black/10"
      />

      {/* Animated Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="text-center text-white"
          style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)" }}
        >
          <motion.h1 
            className="font-medium text-[36px] leading-tight md:text-[48px] lg:text-[72px] lg:leading-[0.9]"
          >
            <motion.span
              variants={textVariants}
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="block font-normal italic leading-none"
            >
              The
            </motion.span>
            <motion.span 
              variants={textVariants}
              className="mt-2 block font-medium uppercase tracking-wider"
            >
              BETTER
            </motion.span>
            <motion.span 
              variants={textVariants}
              className="block font-medium uppercase tracking-wider"
            >
              GIFTS
            </motion.span>
          </motion.h1>
          
          <motion.p 
            variants={textVariants}
            className="mt-4 text-base"
          >
            Gifting you can feel good about.
          </motion.p>
          
          <motion.div 
            variants={containerVariants}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <motion.div variants={buttonVariants} whileHover="hover">
              <Link
                href="/women/new-arrivals"
                className="flex w-full sm:w-auto items-center justify-center rounded-[2px] border border-white bg-transparent px-8 py-3 text-[13px] font-medium uppercase tracking-wider text-white transition-colors duration-300 hover:bg-white hover:text-black"
              >
                Shop Now
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Link
                href="/collections/gift-guide"
                className="flex w-full sm:w-auto items-center justify-center rounded-[2px] border border-white bg-transparent px-8 py-3 text-[13px] font-medium uppercase tracking-wider text-white transition-colors duration-300 hover:bg-white hover:text-black"
              >
                Explore the Gift Guide
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
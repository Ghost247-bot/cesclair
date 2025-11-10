"use client";

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';

const SustainabilityBanner = () => {
  const backgroundImageUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/68ee3c4b_56f2-15.jpg";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const textVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const linkVariants = {
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

  const backgroundVariants = {
    hidden: { scale: 1.1, opacity: 0 },
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
    <section
      className="relative w-full bg-cover bg-center overflow-hidden"
      aria-labelledby="sustainability-heading"
    >
      <motion.div
        variants={backgroundVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${backgroundImageUrl})`,
        }}
      />
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-12 sm:py-[60px] md:py-[80px] lg:py-[120px] text-center text-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            variants={textVariants}
            id="sustainability-heading"
            className="font-medium uppercase tracking-tight text-xl sm:text-2xl md:text-[38px] md:leading-[1.15] lg:text-[52px] lg:leading-[1.1] leading-[1.2]"
          >
            Sustainability Looks Better With Receipts.
            <br />
            Here's Ours.
          </motion.h2>
          <motion.div variants={linkVariants} whileHover="hover">
            <Link
              href="/sustainability"
              className="mt-4 sm:mt-6 inline-block text-sm sm:text-base uppercase underline tracking-[0.05em] transition-all duration-200 hover:tracking-[0.08em]"
            >
              Read Our Latest Impact Report
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SustainabilityBanner;
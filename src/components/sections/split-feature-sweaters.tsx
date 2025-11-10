"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const SplitFeatureSweaters = () => {
  const imageVariants = {
    hidden: { scale: 1.1, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const contentVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.2
      }
    }
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4
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

  return (
    <section className="flex flex-col md:block md:relative md:aspect-[4/5]">
      {/* Container for image and its overlay */}
      <motion.div 
        variants={imageVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative aspect-[4/5] md:absolute md:inset-0"
      >
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/53a91526_0f42-9.jpg"
          alt="A woman wearing a burgundy sweater over a collared shirt."
          fill
          className="z-0 object-cover"
          priority
        />
        {/* Desktop-only overlay */}
        <div className="hidden md:block absolute inset-0 bg-black/15 z-10"></div>
      </motion.div>

      {/* Content Block */}
      <motion.div 
        variants={contentVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="bg-white text-center py-6 px-4 sm:py-8 sm:px-6 md:bg-transparent md:text-left md:absolute md:inset-0 md:z-20 md:p-8 md:flex md:flex-col md:items-start md:justify-start"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            variants={textVariants}
            className="text-xl sm:text-2xl font-medium uppercase text-primary-text md:text-white"
          >
            THE SWEATER SHOP
          </motion.h2>
          <motion.p 
            variants={textVariants}
            className="mt-2 text-sm sm:text-base text-secondary-text md:text-white"
          >
            Premium styles made to last.
          </motion.p>
          <motion.div variants={buttonVariants} whileHover="hover">
            <Link
              href="/collections/sweater-shop"
              className="mt-3 sm:mt-4 inline-block border px-5 sm:px-6 py-2 sm:py-2.5 text-xs font-medium uppercase tracking-wider transition-colors text-primary-text border-primary-text hover:bg-gray-100 md:text-white md:border-white md:hover:bg-white/10"
            >
              SHOP NOW
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SplitFeatureSweaters;
"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';

const contentData = [
  {
    title: 'No-Fail Outfits',
    href: '/content/no-fail-outfits',
    imageSrc: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/415060f1_ee5b-13.jpg',
    imageAlt: 'Model wearing a brown track jacket and wide-leg pants in a minimalist setting.',
  },
  {
    title: (
      <>
        Behind the
        <br />
        Holiday Edit 001
      </>
    ),
    href: '/collections/holiday-edit',
    imageSrc: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/5cde1622_bc63-14.jpg',
    imageAlt: 'Close-up of a person wearing a textured brown fleece jacket.',
  },
];

const ContentGrid = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const textVariants = {
    hover: {
      y: -5,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <section>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2"
      >
        {contentData.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover="hover"
          >
            <Link href={item.href} className="group flex flex-col">
              <motion.div 
                variants={imageVariants}
                className="relative w-full aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 ease-in-out"
                />
              </motion.div>
              <motion.div 
                variants={textVariants}
                className="bg-background flex-grow flex items-center justify-center p-4 sm:p-6 md:p-12 text-center"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-[32px] font-medium leading-tight md:leading-[1.3] uppercase text-primary-text">
                    {item.title}
                  </h2>
                  <span className="mt-3 sm:mt-4 inline-block text-xs sm:text-sm font-normal uppercase leading-none tracking-[0.05em] text-primary-text underline decoration-1 underline-offset-4 transition-colors group-hover:text-link-hover group-hover:no-underline">
                    Read More
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default ContentGrid;
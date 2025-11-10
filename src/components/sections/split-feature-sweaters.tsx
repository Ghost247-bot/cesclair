"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';

const SplitFeatureSweaters = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Parallax effect for image
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1]);

  const imageVariants = {
    hidden: { scale: 1.2, opacity: 0, filter: "blur(10px)" },
    visible: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
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
        delay: 0.4
      }
    },
    hover: {
      opacity: 0.7,
      transition: {
        duration: 0.3
      }
    }
  };

  const contentVariants = {
    hidden: { x: -80, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.34, 1.56, 0.64, 1], // Back easing for bounce effect
        delay: 0.3
      }
    }
  };

  const titleVariants = {
    hidden: { 
      y: 30, 
      opacity: 0,
      clipPath: "inset(0 100% 0 0)"
    },
    visible: {
      y: 0,
      opacity: 1,
      clipPath: "inset(0 0% 0 0)",
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.5
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
        delay: 0.7
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5
      }
    }
  };

  const buttonVariants = {
    hidden: { 
      y: 30, 
      opacity: 0,
      scale: 0.9,
      x: -20
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.9
      }
    },
    hover: {
      scale: 1.05,
      x: 5,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const arrowVariants = {
    hidden: { x: -5, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: 1.1
      }
    },
    hover: {
      x: 5,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="flex flex-col md:block md:relative md:aspect-[4/5] overflow-hidden"
    >
      {/* Container for image and its overlay */}
      <motion.div 
        variants={imageVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        style={{
          y: imageY,
          scale: imageScale
        }}
        whileHover={{
          scale: 1.05,
          transition: {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1]
          }
        }}
        className="relative aspect-[4/5] md:absolute md:inset-0"
      >
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/53a91526_0f42-9.jpg"
          alt="A woman wearing a burgundy sweater over a collared shirt."
          fill
          className="z-0 object-cover transition-transform duration-700 ease-out"
          priority
        />
        {/* Animated Desktop-only overlay */}
        <motion.div 
          variants={overlayVariants}
          whileHover="hover"
          className="hidden md:block absolute inset-0 bg-black/15 z-10"
        />
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
          className="md:max-w-md"
        >
          <motion.h2 
            variants={titleVariants}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium uppercase text-primary-text md:text-white tracking-tight"
            style={{
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"
            }}
          >
            THE SWEATER SHOP
          </motion.h2>
          <motion.p 
            variants={descriptionVariants}
            className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-secondary-text md:text-white/90 leading-relaxed"
            style={{
              textShadow: "0 1px 5px rgba(0, 0, 0, 0.2)"
            }}
          >
            Premium styles made to last.
          </motion.p>
          <motion.div 
            variants={buttonVariants} 
            whileHover="hover"
            className="mt-4 sm:mt-6"
          >
            <Link
              href="/collections/sweater-shop"
              className="group inline-flex items-center gap-2 border px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-medium uppercase tracking-wider transition-all duration-300 text-primary-text border-primary-text hover:bg-gray-100 md:text-white md:border-white md:hover:bg-white/20 md:hover:border-white/80"
            >
              <span>SHOP NOW</span>
              <motion.span
                variants={arrowVariants}
                className="inline-block"
              >
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SplitFeatureSweaters;
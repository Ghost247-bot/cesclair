"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useHydrated } from '@/lib/useHydrated';
import { normalizeImagePath } from '@/lib/utils';

const categories = [
  {
    name: 'SHOP SWEATERS',
    href: '/women/sweaters',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/e3425db7_4c00-3.jpg',
    alt: 'A dark green knitted cardigan on a hanger against a light background.',
  },
  {
    name: 'SHOP TEES',
    href: '/women/tees-tops',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg',
    alt: 'A beige long-sleeved ribbed t-shirt against a light background.',
  },
  {
    name: 'SHOP PANTS',
    href: '/women/pants',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/0f25034f_872d-5.jpg',
    alt: 'A pair of dark brown wide-leg trousers against a light background.',
  },
  {
    name: 'SHOP DENIM',
    href: '/women/denim',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1996bc0b_bdd3-6.jpg',
    alt: 'A pair of classic blue wash denim jeans against a light background.',
  },
  {
    name: 'SHOP COATS & JACKETS',
    href: '/women/outerwear',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/74db686e_9039-7.jpg',
    alt: 'A rust orange puffer jacket laid flat against a light background.',
  },
  {
    name: 'SHOP SHOES',
    href: '/women/shoes',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/f9db9668_e24a-8.jpg',
    alt: 'A pair of black leather derby shoes against a light background.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const headingVariants = {
  hidden: { 
    opacity: 0, 
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const CategoryGrid = () => {
  const hydrated = useHydrated();
  const headingControls = useAnimation();
  const containerControls = useAnimation();

  useEffect(() => {
    if (hydrated) {
      headingControls.start("visible");
      containerControls.start("visible");
    }
  }, [hydrated, headingControls, containerControls]);

  return (
    <section className="bg-[#f7f7f7] py-8 sm:py-12 md:py-16 overflow-hidden">
      <div className="container px-4 sm:px-6">
        <motion.h3 
          className="mb-6 sm:mb-8 text-center text-xs sm:text-sm md:text-[14px] font-normal uppercase tracking-[0.1em] text-foreground"
          variants={headingVariants}
          initial={false}
          animate={headingControls}
        >
          CLEAN LUXURY. BETTER FOR YOU.
        </motion.h3>
        <motion.div 
          className="flex snap-x snap-mandatory gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 md:gap-4 md:pb-0 lg:grid-cols-6"
          variants={containerVariants}
          initial={false}
          animate={containerControls}
        >
          {categories.map((category, index) => {
            const CategoryImage = ({ category }: { category: typeof categories[0] }) => {
              const [imgError, setImgError] = useState(false);
              const imageSrc = normalizeImagePath(category.image);
              
              if (imgError) {
                return (
                  <div className="aspect-[3/4] w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-400 text-center px-2">{category.alt}</span>
                  </div>
                );
              }
              
              return (
                <Image
                  src={imageSrc}
                  alt={category.alt}
                  width={480}
                  height={640}
                  className="aspect-[3/4] w-full object-cover"
                  unoptimized
                  onError={() => setImgError(true)}
                />
              );
            };
            
            return (
              <motion.div
                key={category.name}
                className="w-[70%] flex-shrink-0 snap-start sm:w-2/5 md:w-auto"
                variants={itemVariants}
                initial={false}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <Link href={category.href} className="group block">
                  <motion.div 
                    className="overflow-hidden bg-gray-200 rounded-sm"
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <CategoryImage category={category} />
                  </motion.div>
                <motion.p 
                  className="mt-3 sm:mt-4 text-center text-xs sm:text-[13px] font-medium uppercase tracking-wider text-foreground transition-colors group-hover:text-link-hover"
                  whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                >
                  {category.name}
                </motion.p>
              </Link>
            </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;
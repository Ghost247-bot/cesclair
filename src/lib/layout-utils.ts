// Utility functions for consistent layout handling

export const HEADER_HEIGHT_MOBILE = 60; // h-[60px]
export const HEADER_HEIGHT_DESKTOP = 64; // h-[64px]

export const HEADER_PADDING_CLASSES = `pt-[60px] md:pt-[64px]`;

// For pages with full viewport hero sections, use these classes
export const HERO_SECTION_CLASSES = `pt-[60px] md:pt-[64px]`;

// For pages that need to account for header in calculations
export const getHeaderHeight = () => {
  if (typeof window === 'undefined') return HEADER_HEIGHT_MOBILE;
  return window.innerWidth >= 768 ? HEADER_HEIGHT_DESKTOP : HEADER_HEIGHT_MOBILE;
};

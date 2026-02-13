"use client";

import { useEffect } from 'react';

interface ScrollToFooterProps {
  children: React.ReactNode;
}

export default function ScrollToFooter({ children }: ScrollToFooterProps) {
  useEffect(() => {
    // Check if URL has a hash pointing to footer
    const hash = window.location.hash;
    
    if (hash === '#footer' || hash === '#footer-section') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const footerElement = document.getElementById('footer');
        if (footerElement) {
          footerElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      // Default: scroll to top if no hash
      window.scrollTo(0, 0);
    }
  }, []);

  // Also handle navigation changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === '#footer' || hash === '#footer-section') {
        setTimeout(() => {
          const footerElement = document.getElementById('footer');
          if (footerElement) {
            footerElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      } else {
        // Scroll to top when hash changes to something other than footer
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return <>{children}</>;
}

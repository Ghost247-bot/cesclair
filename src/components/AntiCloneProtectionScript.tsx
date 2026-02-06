"use client";

import { useEffect } from 'react';

export default function AntiCloneProtectionScript() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Define event handlers outside try-catch so they're accessible in cleanup
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'S' || e.key === 'P'))
      ) {
        e.preventDefault();
        return false;
      }
    };
    
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };
    
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };
    
    try {
      // Add event listeners
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('selectstart', handleSelectStart);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('dragstart', handleDragStart);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('cut', handleCut);
      
      // Disable text selection via CSS
      if (document.body) {
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
      }
    } catch (error) {
      // Only log errors in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('Anti-clone protection error:', error);
      }
    }
    
    // Cleanup function - returned from useEffect, not from try-catch
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      
      // Re-enable text selection
      if (document.body) {
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.mozUserSelect = '';
        document.body.style.msUserSelect = '';
      }
    };
  }, []);

  return null;
}


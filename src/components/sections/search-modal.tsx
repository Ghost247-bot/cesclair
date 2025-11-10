"use client";

import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingSearches = [
  'Cashmere sweater',
  'Organic cotton tee',
  'High-rise jeans',
  'Wool coat',
  'Leather bag',
  'Chelsea boots'
];

const popularCategories = [
  { name: 'New Arrivals', link: '/women/new-arrivals' },
  { name: 'Sweaters', link: '/women/sweaters' },
  { name: 'Pants', link: '/women/pants' },
  { name: 'Shoes', link: '/women/shoes' }
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 shadow-lg animate-in slide-in-from-top duration-300">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 py-6 border-b border-border">
            <Search className="w-5 h-5 text-secondary-text" />
            <input
              type="text"
              placeholder="SEARCH"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-base outline-none placeholder:text-secondary-text placeholder:tracking-wider"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-2 hover:opacity-70 transition-opacity"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Results / Suggestions */}
          <div className="py-12">
            {searchQuery.length === 0 ? (
              <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
                {/* Trending Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-4 h-4" />
                    <h3 className="text-label font-medium">TRENDING SEARCHES</h3>
                  </div>
                  <ul className="space-y-3">
                    {trendingSearches.map((term) => (
                      <li key={term}>
                        <button
                          onClick={() => setSearchQuery(term)}
                          className="text-body hover:opacity-70 transition-opacity text-left"
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Popular Categories */}
                <div>
                  <h3 className="text-label font-medium mb-6">POPULAR CATEGORIES</h3>
                  <ul className="space-y-3">
                    {popularCategories.map((category) => (
                      <li key={category.name}>
                        <Link
                          href={category.link}
                          onClick={onClose}
                          className="text-body hover:opacity-70 transition-opacity"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-secondary-text text-sm">
                  Searching for "{searchQuery}"...
                </p>
                <p className="text-secondary-text text-sm mt-4">
                  Press Enter to search
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

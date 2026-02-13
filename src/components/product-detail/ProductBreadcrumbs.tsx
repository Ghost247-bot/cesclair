"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ProductBreadcrumbsProps {
  productName: string;
  categoryName?: string | null;
  brand?: string | null;
}

export default function ProductBreadcrumbs({ 
  productName, 
  categoryName, 
  brand 
}: ProductBreadcrumbsProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
  ];

  // Add category if available
  if (categoryName) {
    breadcrumbs.push({ 
      label: categoryName, 
      href: `/products?category=${categoryName.toLowerCase()}` 
    });
  }

  // Add brand if available and different from category
  if (brand && brand !== categoryName) {
    breadcrumbs.push({ 
      label: brand, 
      href: `/products?brand=${brand.toLowerCase()}` 
    });
  }

  return (
    <nav className="flex items-center text-sm text-gray-600 mb-6">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          )}
          <Link
            href={item.href}
            className="hover:text-black transition-colors"
          >
            {item.label}
          </Link>
        </div>
      ))}
      <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
      <span className="text-gray-900 font-medium truncate max-w-[200px]">
        {productName}
      </span>
    </nav>
  );
}

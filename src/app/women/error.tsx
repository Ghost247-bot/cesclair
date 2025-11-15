"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Women section error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-[60px] md:pt-[64px]">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-medium text-primary-text">Something went wrong!</h1>
        <p className="text-body text-secondary-text">
          We encountered an error loading this page. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/women"
            className="px-6 py-3 border border-border hover:bg-muted transition-colors"
          >
            Browse Women
          </Link>
        </div>
      </div>
    </div>
  );
}


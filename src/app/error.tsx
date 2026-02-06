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
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-medium text-primary-text">Something went wrong!</h1>
        <p className="text-body text-secondary-text">
          An unexpected error occurred. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="mt-4 text-left bg-muted p-4 rounded">
            <summary className="cursor-pointer text-sm font-medium mb-2">Error details</summary>
            <pre className="text-xs overflow-auto">{error.message}</pre>
            {error.digest && (
              <p className="text-xs mt-2 text-muted-foreground">Digest: {error.digest}</p>
            )}
          </details>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-border hover:bg-muted transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}


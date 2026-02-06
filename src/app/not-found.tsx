import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-[60px] md:pt-[64px]">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-6xl font-medium text-primary-text">404</h1>
        <h2 className="text-2xl font-medium text-primary-text">Page Not Found</h2>
        <p className="text-body text-secondary-text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/women/new-arrivals"
            className="px-6 py-3 border border-border hover:bg-muted transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}


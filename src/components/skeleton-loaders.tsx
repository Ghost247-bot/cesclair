export function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-lg p-4 sm:p-5 md:p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-lg p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-lg p-4 sm:p-5 md:p-6 animate-pulse">
          <div className="h-8 w-8 bg-gray-200 rounded mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonImage() {
  return (
    <div className="w-full h-48 sm:h-64 md:h-80 bg-gray-200 rounded-lg animate-pulse"></div>
  );
}


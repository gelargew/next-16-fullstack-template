export function UserTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
        <div className="flex items-center space-x-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="border-b">
          <div className="grid grid-cols-5 gap-4 p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="divide-y">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-36"></div>
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
        <div className="flex items-center space-x-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
      </div>
    </div>
  )
}
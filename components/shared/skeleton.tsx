// Reusable skeleton loading components
// components/shared/skeleton.tsx

"use client";

// Base Skeleton component
export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-base-200 via-base-300 to-base-200 bg-[length:200%_100%] rounded ${className}`}
    />
  );
};

// Event Card Skeleton
export const EventCardSkeleton = () => {
  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />

      <div className="card-body">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4 mb-2" />

        {/* Description skeleton */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-4" />

        {/* Date & location skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Button skeleton */}
        <div className="card-actions justify-end mt-4">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar skeleton */}
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-10 w-32 mt-6" />
      </div>
    </div>
  );
};

// Notification Item Skeleton
export const NotificationSkeleton = () => {
  return (
    <div className="p-4 border-b border-base-200">
      <div className="flex items-start gap-3">
        {/* Dot skeleton */}
        <Skeleton className="w-2 h-2 rounded-full mt-1.5" />

        <div className="flex-1">
          {/* Message skeleton */}
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4 mb-2" />

          {/* Time skeleton */}
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
};

// Event List Skeleton (multiple cards)
export const EventListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Notification List Skeleton
export const NotificationListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <NotificationSkeleton key={index} />
      ))}
    </div>
  );
};

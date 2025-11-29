import { ShareIcon, UsersIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ControlActiveProjectPageSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Project Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <Skeleton className="h-9 w-64" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Participation Link Section Skeleton */}
      <div className="mb-8 rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShareIcon className="h-5 w-5 text-primary" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="mb-4 h-4 w-full max-w-lg" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Participants Section Skeleton */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-primary" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-2">
          {Array.from({
            length: 3,
          }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

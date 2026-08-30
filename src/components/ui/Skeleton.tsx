import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`}
      {...props}
    />
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number; rows?: number }> = ({
  columns = 6,
  rows = 5,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="divide-x divide-slate-100 animate-pulse">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="py-3 px-4">
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const CardListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const NotificationListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="py-3 px-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 animate-pulse"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-14 rounded" />
              </div>
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
};

export const DashboardAppSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-[#2C3968] flex selection:bg-[#dbeafe]">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r border-[#e2e8f0] bg-[#f8fafc] p-4 flex flex-col justify-between shrink-0 min-h-screen animate-pulse">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Skeleton className="w-8 h-8 rounded-xl bg-blue-200" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-2 pt-4 border-t border-[#e2e8f0]">
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </aside>

      {/* Main Workspace Skeleton */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl animate-pulse">
        {/* Header Greeting Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-[#e2e8f0] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-8 h-8 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>

        {/* Main Card/Table Skeleton */}
        <div className="p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-32 rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
};

export function FicCardSkeleton() {
  return (
    <div className="w-full h-[460px] rounded-2xl bg-white/10 border border-white/10 overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        {/* Rating badges skeleton */}
        <div className="flex gap-2">
          <div className="h-6 w-12 rounded-full bg-white/10" />
          <div className="h-6 w-12 rounded-full bg-white/10" />
        </div>

        {/* Title skeleton */}
        <div className="h-8 w-3/4 rounded bg-white/10" />

        {/* Author skeleton */}
        <div className="h-5 w-1/4 rounded bg-white/10" />

        {/* Summary skeleton */}
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-5/6 rounded bg-white/10" />
          <div className="h-4 w-4/6 rounded bg-white/10" />
        </div>

        {/* Meter bars skeleton */}
        <div className="space-y-3 pt-4">
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/10" />
        </div>

        {/* Stats skeleton */}
        <div className="flex gap-4 pt-4">
          <div className="h-4 w-16 rounded bg-white/10" />
          <div className="h-4 w-16 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}


export function FicCardSkeleton() {
  return (
    <div className="h-[430px] w-full animate-pulse overflow-hidden rounded-[4px] border border-[rgba(200,160,100,0.1)] bg-[rgba(30,18,14,0.65)]">
      <div className="space-y-4 p-6">
        <div className="flex gap-2">
          <div className="h-6 w-24 rounded-[4px] bg-white/10" />
          <div className="h-6 w-16 rounded-[4px] bg-white/10" />
        </div>

        <div className="h-8 w-3/4 rounded-[4px] bg-white/10" />
        <div className="h-5 w-1/4 rounded-[4px] bg-white/10" />

        <div className="space-y-2 pt-2">
          <div className="h-4 w-full rounded-[4px] bg-white/10" />
          <div className="h-4 w-5/6 rounded-[4px] bg-white/10" />
          <div className="h-4 w-4/6 rounded-[4px] bg-white/10" />
        </div>

        <div className="flex gap-4 pt-4">
          <div className="h-4 w-16 rounded-[4px] bg-white/10" />
          <div className="h-4 w-16 rounded-[4px] bg-white/10" />
        </div>
      </div>
    </div>
  );
}

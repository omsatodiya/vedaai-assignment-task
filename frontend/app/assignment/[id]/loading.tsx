export default function AssignmentLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header card skeleton */}
      <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#e5e7eb] animate-pulse flex-shrink-0" />

          {/* Title + meta */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-5 w-2/3 rounded-lg bg-[#e5e7eb] animate-pulse" />
            <div className="h-3.5 w-48 rounded bg-[#f3f4f6] animate-pulse" />
          </div>

          {/* Status badge */}
          <div className="h-6 w-20 rounded-full bg-[#f3f4f6] animate-pulse flex-shrink-0" />
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="h-1.5 w-full rounded-full bg-[#f3f4f6] animate-pulse" />
          <div className="h-3.5 w-40 rounded bg-[#f3f4f6] animate-pulse" />
        </div>
      </div>

      {/* Placeholder content area */}
      <div className="flex flex-col items-center gap-3 py-16 text-[#e5e7eb]">
        <div className="w-8 h-8 rounded-full bg-[#f3f4f6] animate-pulse" />
        <div className="h-4 w-48 rounded bg-[#f3f4f6] animate-pulse" />
      </div>
    </div>
  );
}

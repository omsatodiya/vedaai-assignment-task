export default function CreateLoading() {
  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Progress bar skeleton */}
      <div className="w-full h-1 rounded-full bg-[#e5e7eb] overflow-hidden">
        <div className="h-full w-1/2 bg-[#d1d5db] rounded-full animate-pulse" />
      </div>

      {/* Heading skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-7 w-52 rounded-lg bg-[#e5e7eb] animate-pulse" />
        <div className="h-4 w-72 rounded bg-[#f3f4f6] animate-pulse" />
      </div>

      {/* Form card skeleton */}
      <div className="bg-[#fafafa] rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
        <div className="px-6 py-6 md:px-8 md:py-7 flex flex-col gap-7">
          {/* Section header */}
          <div className="pb-5 border-b border-[#f3f4f6] flex flex-col gap-2">
            <div className="h-4 w-40 rounded bg-[#e5e7eb] animate-pulse" />
            <div className="h-3.5 w-64 rounded bg-[#f3f4f6] animate-pulse" />
          </div>

          {/* Title field */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-36 rounded bg-[#e5e7eb] animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-[#f3f4f6] animate-pulse" />
          </div>

          {/* File upload */}
          <div className="h-36 w-full rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#f9fafb] animate-pulse" />

          {/* Due date */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 rounded bg-[#e5e7eb] animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-[#f3f4f6] animate-pulse" />
          </div>

          {/* Question config rows */}
          <div className="flex flex-col gap-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-12 w-full rounded-2xl bg-[#f3f4f6] animate-pulse" />
            ))}
          </div>

          {/* Additional info */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-44 rounded bg-[#e5e7eb] animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-[#f3f4f6] animate-pulse" />
          </div>
        </div>

        {/* Nav footer */}
        <div className="px-6 md:px-8 py-5 border-t border-[#f3f4f6] flex justify-end">
          <div className="h-10 w-24 rounded-full bg-[#e5e7eb] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

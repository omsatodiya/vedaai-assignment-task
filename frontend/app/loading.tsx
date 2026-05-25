/**
 * Root loading.tsx — shown by Next.js App Router while the home page
 * is navigating / suspending. Mirrors the home page layout with skeletons
 * and includes a Render cold-start notice.
 */
export default function RootLoading() {
  return (
    <div className="flex flex-col gap-6 min-h-full">
      {/* Cold-start notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
        <span className="text-amber-500 mt-0.5 text-base leading-none">⚠</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Backend is waking up
          </p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            The server is hosted on Render's free tier and may take up to 40
            seconds to respond after a period of inactivity. Please wait.
          </p>
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="flex items-center gap-3 bg-white border border-[#e5e7eb] p-3 rounded-2xl">
        <div className="flex-1 h-10 rounded-xl bg-[#f3f4f6] animate-pulse" />
        <div className="w-10 h-10 rounded-xl bg-[#f3f4f6] animate-pulse flex-shrink-0" />
        <div className="w-36 h-10 rounded-xl bg-[#f3f4f6] animate-pulse flex-shrink-0" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col gap-4"
          >
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-4 w-3/4 rounded-lg bg-[#f3f4f6] animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-5 w-20 rounded-full bg-[#f3f4f6] animate-pulse" />
                  <div className="h-5 w-28 rounded-full bg-[#f3f4f6] animate-pulse" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#f3f4f6] animate-pulse flex-shrink-0" />
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between border-t border-[#f3f4f6] pt-3.5">
              <div className="h-3.5 w-36 rounded bg-[#f3f4f6] animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-[#f3f4f6] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shown instantly while a signed-in page is being prepared on the server, so navigation never looks frozen. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span aria-hidden className="size-14 animate-pulse rounded-full border-[3px] border-ink bg-pink shadow-hard" />
      <p className="hand text-[28px] text-pink">packing the trail snacks…</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}

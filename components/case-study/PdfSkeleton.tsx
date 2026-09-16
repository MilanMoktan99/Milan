export function PdfSkeleton() {
  return (
    <div
      role="status"
      className="grid aspect-[1/1.414] w-full place-items-center rounded-sm bg-fg/5"
    >
      <span className="text-sm text-muted motion-safe:animate-pulse">
        Loading case study…
      </span>
    </div>
  );
}
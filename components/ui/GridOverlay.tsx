export function GridOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30">
      <div className="site-grid h-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{ transitionDelay: `${i * 35}ms` }}
            className={`h-full origin-top scale-y-0 border-x border-fg/15 transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] show-grid:scale-y-100 motion-reduce:transition-none ${
              i >= 8 ? "hidden lg:block" : i >= 4 ? "hidden md:block" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
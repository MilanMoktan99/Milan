type LogoProps = {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
};

const TOTAL = "ilan".length + "\u00A0Moktan".length;
const ease = "ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none";

function Reveal({ text, start }: { text: string; start: number }) {
  return (
    <span
      className={`grid grid-cols-[0fr] transition-[grid-template-columns] duration-700 ${ease} group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]`}
    >
      <span className="-my-[0.15em] overflow-hidden py-[0.15em]">
        <span className="flex">
          {text.split("").map((char, i) => {
            const n = start + i;
            return (
              <span
                key={i}
                style={
                  {
                    "--in": `${n * 35}ms`,
                    "--out": `${(TOTAL - 1 - n) * 20}ms`,
                  } as React.CSSProperties
                }
                className={`translate-y-[0.4em] opacity-0 blur-[3px] transition-[opacity,translate,filter] duration-500 ${ease} [transition-delay:var(--out)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-none group-hover:[transition-delay:var(--in)] group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:blur-none group-focus-visible:[transition-delay:var(--in)]`}
              >
                {char}
              </span>
            );
          })}
        </span>
      </span>
    </span>
  );
}

export function Logo({ onClick, className = "" }: LogoProps) {
  return (
    <a
      href="#intro"
      onClick={onClick}
      aria-label="Milan Moktan, back to top"
      className={`group inline-flex font-medium leading-none tracking-tight whitespace-nowrap ${className}`}
    >
      <span aria-hidden className="inline-flex">
        <span>M</span>
        <Reveal text="ilan" start={0} />
        <Reveal text={"\u00A0Moktan"} start={4} />
      </span>
    </a>
  );
}
import type { ReactNode } from "react";

export function ReplayButton({ onClick, label = "Replay" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="u-label inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 transition-colors hover:border-signal hover:text-signal"
      style={{ textTransform: "uppercase" }}
    >
      <span aria-hidden>↻</span> {label}
    </button>
  );
}

export function Scrubber({
  value,
  max,
  onChange,
  label,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <label className="flex w-full items-center gap-3">
      {label && <span className="u-label whitespace-nowrap">{label}</span>}
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-signal"
        style={{ accentColor: "var(--signal)" }}
      />
    </label>
  );
}

/** "This is real output" caption under every widget. */
export function RealBadge({ children }: { children: ReactNode }) {
  return (
    <p className="u-label mt-4 flex items-start gap-2" style={{ textTransform: "none" }}>
      <span
        aria-hidden
        className="mt-[0.15em] inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ background: "var(--signal)" }}
      />
      <span>{children}</span>
    </p>
  );
}

export function Stage({ children, machine = false }: { children: ReactNode; machine?: boolean }) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 sm:p-7",
        machine
          ? "border-machine-line bg-machine-bg text-machine-fg"
          : "border-hairline bg-paper-sunk",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

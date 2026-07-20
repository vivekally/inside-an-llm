import { useEffect, useState } from "react";

const ACTS = [
  { id: "act-eliza", n: 1 },
  { id: "act-shannon", n: 2 },
  { id: "act-xor", n: 3 },
  { id: "act-bpe", n: 4 },
  { id: "act-embeddings", n: 5 },
  { id: "act-attention", n: 6 },
  { id: "act-sampling", n: 7 },
  { id: "act-assistant", n: 8 },
  { id: "act-agents", n: 9 },
];

/** Thin fixed rail on the right showing which act is in view. */
export function ProgressRail() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    ACTS.forEach((a) => {
      const el = document.getElementById(a.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="Progress" className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
      {ACTS.map((a) => {
        const on = active === a.id;
        const built = document.getElementById(a.id);
        return (
          <a
            key={a.id}
            href={`#${a.id}`}
            title={`Act ${a.n}`}
            className="group flex items-center justify-end gap-2"
            style={{ opacity: built ? 1 : 0.35 }}
          >
            <span className="u-num text-[10px] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">
              {String(a.n).padStart(2, "0")}
            </span>
            <span
              className="block h-1.5 rounded-full transition-all"
              style={{
                width: on ? 22 : 8,
                background: on ? "var(--signal)" : "var(--hairline)",
              }}
            />
          </a>
        );
      })}
    </nav>
  );
}

import type { ReactNode } from "react";
import { useInView } from "../lib/useInView";

interface ActProps {
  n: number;
  id: string;
  kicker: string;
  title: ReactNode;
  lede: ReactNode;
  children: ReactNode;
}

/** One act: numbered kicker, display title, lede, then the widget + prose. */
export function Act({ n, id, kicker, title, lede, children }: ActProps) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.12 });
  return (
    <section
      id={id}
      ref={ref}
      className={[
        "relative mx-auto w-full max-w-6xl px-6 py-[clamp(4.5rem,11vh,9rem)]",
        "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      ].join(" ")}
    >
      <div className="u-measure text-center">
        <p className="u-label mb-5">
          <span className="text-signal">Act {String(n).padStart(2, "0")}</span>
          <span className="mx-2 text-hairline">/</span>
          {kicker}
        </p>
        <h2 className="u-display mb-6 text-[clamp(2rem,4.5vw,3.5rem)]">{title}</h2>
        <div className="text-ink-muted">{lede}</div>
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}

/** A short prose beat under a widget, constrained to the reading measure. */
export function Beat({ children }: { children: ReactNode }) {
  return <div className="u-measure mt-10">{children}</div>;
}

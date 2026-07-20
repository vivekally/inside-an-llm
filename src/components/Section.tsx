import type { ReactNode } from "react";
import { useInView } from "../lib/useInView";

interface SectionProps {
  id?: string;
  children: ReactNode;
  /** Dark "inside the machine" panel. */
  machine?: boolean;
  className?: string;
}

/** Full-bleed narrative section with a scroll-triggered fade-up reveal. */
export function Section({ id, children, machine = false, className = "" }: SectionProps) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.2 });

  return (
    <section
      id={id}
      ref={ref}
      className={[
        "relative w-full px-6 py-[clamp(5rem,12vh,10rem)]",
        machine ? "bg-machine-bg text-machine-fg" : "",
        "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

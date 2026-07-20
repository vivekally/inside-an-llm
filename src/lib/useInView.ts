import { useEffect, useRef, useState } from "react";

interface Options {
  /** Fraction of the element that must be visible to count as "in view". */
  threshold?: number;
  /** Fire only the first time it enters view. Default true. */
  once?: boolean;
  rootMargin?: string;
}

/** Observe when an element scrolls into view. Returns a ref and a boolean. */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  opts: Options = {},
): [React.RefObject<T>, boolean] {
  const { threshold = 0.35, once = true, rootMargin = "0px" } = opts;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once, rootMargin]);

  return [ref, inView];
}

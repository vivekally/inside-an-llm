import { useEffect, useState } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

const PROMPT = "Write me a poem about the sea";
const TOKENS = ["Write", " me", " a", " poem", " about", " the", " sea"];

/** Opening: a prompt types itself, then splits into tokens — the whole story in
 *  one gesture. Static (fully typed, split into tokens) under reduced motion. */
export function Hero() {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(reduced ? PROMPT.length : 0);
  const [split, setSplit] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const type = setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= PROMPT.length) {
        clearInterval(type);
        setTimeout(() => setSplit(true), 550);
      }
    }, 55);
    return () => clearInterval(type);
  }, [reduced]);

  return (
    <header className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="u-label mb-8">A visual explainer · from keystroke to answer</p>

      <h1 className="u-display max-w-[16ch] text-[clamp(2.75rem,7vw,6rem)]">
        Inside an <span className="italic text-signal">LLM</span>
      </h1>

      <p className="u-measure mt-8 text-ink-muted">
        You type a sentence and, a second later, a machine answers in fluent
        English. What actually happens in between? I built one from scratch to
        find out. Scroll down.
      </p>

      {/* Prompt → tokens gesture */}
      <div className="mt-16 flex min-h-[3.5rem] flex-wrap items-center justify-center gap-x-1 gap-y-2">
        {!split ? (
          <span className="u-num rounded-md bg-paper-sunk px-4 py-3 text-[clamp(1rem,2vw,1.35rem)]">
            {PROMPT.slice(0, typed)}
            <span
              className="ml-0.5 inline-block w-[2px] bg-signal align-middle motion-safe:animate-pulse"
              style={{ height: "1.1em" }}
            />
          </span>
        ) : (
          TOKENS.map((t, i) => (
            <span
              key={i}
              className="u-num rounded-md bg-paper-sunk px-2.5 py-2 text-[clamp(0.85rem,1.6vw,1.15rem)] ring-1 ring-hairline motion-safe:animate-[fadein_0.4s_ease-out_both]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {t.trim()}
            </span>
          ))
        )}
      </div>
      <p className="u-label mt-4">
        {split ? "7 tokens" : " "}
      </p>

      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-muted motion-safe:animate-bounce"
      >
        ↓
      </div>

      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
    </header>
  );
}

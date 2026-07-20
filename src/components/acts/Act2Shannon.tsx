import { useState } from "react";
import { Act, Beat } from "../Act";
import { Stage, RealBadge } from "../ui/Controls";
import { useArtifact } from "../../lib/data";
import { pct } from "../../lib/viz";

interface Ex {
  context: string;
  count: number;
  next: { ch: string; p: number }[];
  top: string;
  top_p: number;
}
interface Data {
  meta: { sentences: number; chars: number };
  examples: Ex[];
}

export function Act2Shannon() {
  const data = useArtifact<Data>("act2-letter-probs.json");
  const [sel, setSel] = useState(0);

  const ex = data?.examples[sel];

  return (
    <Act
      n={2}
      id="act-shannon"
      kicker="Language is predictable"
      title={<>You already know what comes next</>}
      lede={
        <p>
          In 1950, Claude Shannon had his wife guess the next letter of a
          sentence, one letter at a time, and measured how often she was right.
          His point: given enough context, the next letter is nearly certain.
          Language has a hidden statistical shape. That shape is the whole game.
        </p>
      }
    >
      <div className="mx-auto max-w-2xl">
        <Stage>
          <p className="u-label mb-4">
            After these letters, what comes next?
          </p>
          <div className="mb-6 flex flex-wrap gap-2">
            {data?.examples.map((e, i) => (
              <button
                key={e.context}
                onClick={() => setSel(i)}
                className={[
                  "u-num rounded-md px-3 py-1.5 text-sm ring-1 transition-colors",
                  i === sel
                    ? "bg-ink text-paper ring-ink"
                    : "bg-paper ring-hairline hover:ring-signal",
                ].join(" ")}
              >
                {e.context.replace(/ /g, "␣")}
              </button>
            ))}
          </div>

          {ex && (
            <div>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="u-num text-2xl">{ex.context.replace(/ /g, "␣")}</span>
                <span className="text-ink-muted">→</span>
                <span className="u-num text-2xl text-signal">{ex.top === " " ? "␣" : ex.top}</span>
                <span className="u-label ml-2">{pct(ex.top_p)} of the time</span>
              </div>
              <div className="space-y-1.5">
                {ex.next.map((n) => (
                  <div key={n.ch} className="flex items-center gap-3">
                    <span className="u-num w-6 text-right">{n.ch === " " ? "␣" : n.ch}</span>
                    <div className="h-5 flex-1 overflow-hidden rounded bg-paper">
                      <div
                        className="h-full rounded transition-[width] duration-500 ease-out motion-reduce:transition-none"
                        style={{
                          width: `${Math.max(2, n.p * 100)}%`,
                          background: n.ch === ex.top ? "var(--signal)" : "var(--cat-6)",
                          opacity: n.ch === ex.top ? 1 : 0.5,
                        }}
                      />
                    </div>
                    <span className="u-num w-12 text-right text-sm text-ink-muted">{pct(n.p)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Stage>
        <RealBadge>
          Real letter statistics counted from {data?.meta.sentences ?? "…"}{" "}
          original sentences ({data ? data.meta.chars.toLocaleString() : "…"}{" "}
          characters). Try “th” versus “ea”.
        </RealBadge>
      </div>

      <Beat>
        <p className="mb-4">
          After <span className="u-num">th</span>, the next letter is almost
          always <span className="u-num text-signal">e</span>. After{" "}
          <span className="u-num">ea</span> it's a coin toss. That predictability,
          measured across billions of words, is exactly what a language model
          learns to exploit.
        </p>
        <p className="text-ink-muted">
          People call an LLM a “next-token predictor,” and that's true. But there
          is an enormous amount of machinery between your prompt and that
          prediction. Let's start building it, beginning with the most basic
          question: what even is a “model”?
        </p>
      </Beat>
    </Act>
  );
}

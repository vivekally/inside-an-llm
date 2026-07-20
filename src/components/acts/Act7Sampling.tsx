import { useEffect, useRef, useState } from "react";
import { Act, Beat } from "../Act";
import { Stage, RealBadge, ReplayButton } from "../ui/Controls";
import { useArtifact } from "../../lib/data";
import { useInView } from "../../lib/useInView";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { pct } from "../../lib/viz";

interface Dist { tok: string; p: number }
interface Setting { temp: number; dist: Dist[] }
interface Step { chosen: string; top: Dist[] }
interface Data {
  meta: { params: number; vocab_size: number };
  prompt: string[];
  settings: Setting[];
  generation: Step[];
}

const TEMP_LABEL = ["predictable", "balanced", "wild"];

export function Act7Sampling() {
  const data = useArtifact<Data>("act7-distributions.json");
  const reduced = useReducedMotion();
  const [ti, setTi] = useState(1);
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [genN, setGenN] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number>();

  const total = data?.generation.length ?? 0;

  useEffect(() => {
    if (!data) return;
    if (reduced) { setGenN(total); return; }
    if (inView && genN === 0 && !playing) setPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, data, reduced]);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setGenN((n) => {
        if (n >= total) { setPlaying(false); return n; }
        return n + 1;
      });
    }, 480);
    return () => clearInterval(timer.current);
  }, [playing, total]);

  if (!data) return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-paper-sunk" />;

  const setting = data.settings[ti];
  const maxP = Math.max(...setting.dist.map((d) => d.p));
  const genWords = data.generation.slice(0, genN);

  return (
    <Act
      n={7}
      id="act-sampling"
      kicker="One token at a time"
      title={<>It doesn't pick the answer. It rolls the dice.</>}
      lede={
        <p>
          The model's output isn't a word — it's a probability for every token in
          its vocabulary. Then it samples one. “Temperature” controls how boldly:
          low means play it safe, high means take risks. Append the token, run the
          whole machine again, repeat. That's how a sentence gets written.
        </p>
      }
    >
      <div ref={ref} className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {/* distribution + temperature */}
        <Stage>
          <p className="u-label mb-2">After the prompt</p>
          <p className="mb-4">
            <span className="u-num rounded bg-paper px-2 py-1 ring-1 ring-hairline">{data.prompt.join(" ")}</span>
            <span className="u-num text-ink-muted"> … ?</span>
          </p>
          <div className="mb-4 flex gap-2">
            {data.settings.map((s, i) => (
              <button key={i} onClick={() => setTi(i)}
                className={["u-label rounded-full px-3 py-1.5 ring-1 transition-colors", i === ti ? "bg-signal text-paper ring-signal" : "ring-hairline hover:ring-signal"].join(" ")}
                style={{ textTransform: "none" }}>
                temp {s.temp} · {TEMP_LABEL[i]}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            {setting.dist.map((d) => (
              <div key={d.tok} className="flex items-center gap-3">
                <span className="u-num w-20 text-right text-sm">{d.tok}</span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-paper">
                  <div className="h-full rounded transition-[width] duration-500 ease-out motion-reduce:transition-none"
                    style={{ width: `${Math.max(2, (d.p / maxP) * 100)}%`, background: d.p === maxP ? "var(--signal)" : "var(--cat-6)", opacity: d.p === maxP ? 1 : 0.55 }} />
                </div>
                <span className="u-num w-11 text-right text-xs text-ink-muted">{pct(d.p)}</span>
              </div>
            ))}
          </div>
          <p className="u-label mt-3" style={{ textTransform: "none" }}>
            Same prediction, three temperatures. Low sharpens toward the top pick;
            high flattens the field so surprises get a chance.
          </p>
        </Stage>

        {/* autoregressive generation */}
        <Stage machine>
          <div className="mb-3 flex items-center justify-between">
            <p className="u-label" style={{ color: "var(--machine-fg)", opacity: 0.6 }}>Writing, token by token</p>
            <ReplayButton label={playing ? "Writing" : "Replay"} onClick={() => { setGenN(0); setPlaying(true); }} />
          </div>
          <div className="min-h-[3.5rem] text-lg leading-relaxed">
            <span className="u-num text-machine-fg/60">{data.prompt.join(" ")} </span>
            {genWords.map((s, i) => (
              <span key={i} className="u-num"
                style={{ color: i === genN - 1 ? "var(--signal)" : "var(--machine-fg)" }}>
                {s.chosen}{" "}
              </span>
            ))}
            {playing && <span className="u-num text-signal">▍</span>}
          </div>
          {genN > 0 && genWords[genN - 1] && (
            <div className="mt-4 border-t border-machine-line pt-3">
              <p className="u-label mb-2" style={{ color: "var(--machine-fg)", opacity: 0.6 }}>
                This step's candidates
              </p>
              <div className="flex flex-wrap gap-1.5">
                {genWords[genN - 1].top.map((t) => (
                  <span key={t.tok}
                    className="u-num rounded px-2 py-0.5 text-xs"
                    style={{
                      background: t.tok === genWords[genN - 1].chosen ? "var(--signal)" : "transparent",
                      color: t.tok === genWords[genN - 1].chosen ? "var(--paper)" : "var(--machine-fg)",
                      border: "1px solid var(--machine-line)",
                    }}>
                    {t.tok} {pct(t.p)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Stage>
      </div>
      <div className="mx-auto mt-4 max-w-4xl">
        <RealBadge>
          Real output from the {data.meta.params.toLocaleString()}-parameter
          transformer trained for this project. It has no plan — each word is one
          more roll of the dice.
        </RealBadge>
      </div>

      <Beat>
        <p className="mb-4">
          That's the whole trick, start to finish: text becomes tokens, tokens
          become vectors, attention mixes in context, and out comes one
          probability distribution. Sample, append, repeat. A coherent paragraph,
          built one blind step at a time.
        </p>
        <p className="text-ink-muted">
          But what we've built so far is a fancy autocomplete. How did that become
          something that answers questions and uses tools? Two more steps.
        </p>
      </Beat>
    </Act>
  );
}

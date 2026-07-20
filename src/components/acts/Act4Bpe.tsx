import { useEffect, useRef, useState } from "react";
import { Act, Beat } from "../Act";
import { Stage, RealBadge, Scrubber, ReplayButton } from "../ui/Controls";
import { useArtifact } from "../../lib/data";
import { useInView } from "../../lib/useInView";
import { useReducedMotion } from "../../lib/useReducedMotion";

interface Merge {
  step: number;
  pair: [string, string];
  token: string;
  count: number;
}
interface Data {
  meta: { sentences: number; unique_words: number; merges: number; vocab_size: number };
  merges: Merge[];
  vocab: string[];
  examples: { word: string; tokens: string[] }[];
}

const disp = (s: string) => s.replace(/_/g, "␣").replace(/</g, "").replace(/>/g, "");

export function Act4Bpe() {
  const data = useArtifact<Data>("act4-bpe-merges.json");
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number>();

  const total = data?.merges.length ?? 0;

  useEffect(() => {
    if (!data || reduced) {
      if (data && reduced) setStep(total);
      return;
    }
    if (inView && !playing && step === 0) setPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, data, reduced]);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setStep((s) => {
        if (s >= total) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 260);
    return () => clearInterval(timer.current);
  }, [playing, total]);

  if (!data) return <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-2xl bg-paper-sunk" />;

  const cur = data.merges[Math.min(step, total) - 1];
  const vocabShown = Math.min(data.vocab.length, 26 + step); // chars + merges so far

  return (
    <Act
      n={4}
      id="act-bpe"
      kicker="Words become tokens"
      title={<>The model doesn't read words. It reads tokens.</>}
      lede={
        <p>
          Before anything else, your text is chopped into tokens — chunks
          somewhere between letters and words. The algorithm, byte-pair encoding,
          starts with single characters and repeatedly glues the most common pair
          together. Watch a vocabulary build itself from scratch.
        </p>
      }
    >
      <div ref={ref} className="mx-auto max-w-2xl">
        <Stage>
          <div className="mb-4 flex items-center justify-between">
            <p className="u-label">Merge {Math.min(step, total)} of {total}</p>
            <ReplayButton
              label={playing ? "Playing" : "Replay"}
              onClick={() => {
                setStep(0);
                setPlaying(true);
              }}
            />
          </div>

          <div className="mb-5 flex min-h-[3rem] items-center gap-3">
            {cur ? (
              <>
                <span className="u-num rounded bg-paper px-2 py-1 ring-1 ring-hairline">{disp(cur.pair[0])}</span>
                <span className="u-num rounded bg-paper px-2 py-1 ring-1 ring-hairline">{disp(cur.pair[1])}</span>
                <span className="text-ink-muted">merge →</span>
                <span className="u-num rounded bg-signal px-2 py-1 text-paper">{disp(cur.token)}</span>
                <span className="u-label ml-auto">seen {cur.count}×</span>
              </>
            ) : (
              <span className="u-label">Start: every character is its own token.</span>
            )}
          </div>

          <p className="u-label mb-2">Vocabulary · {vocabShown} tokens</p>
          <div className="flex flex-wrap gap-1">
            {data.vocab.slice(0, vocabShown).map((v, i) => (
              <span
                key={i}
                className={[
                  "u-num rounded px-1.5 py-0.5 text-xs ring-1",
                  cur && disp(v) === disp(cur.token)
                    ? "bg-signal text-paper ring-signal"
                    : "bg-paper ring-hairline",
                ].join(" ")}
              >
                {disp(v)}
              </span>
            ))}
          </div>

          <div className="mt-5">
            <Scrubber value={Math.min(step, total)} max={total} onChange={(v) => { setPlaying(false); setStep(v); }} label="Scrub" />
          </div>
        </Stage>
        <RealBadge>
          A real BPE run on {data.meta.sentences} sentences: {data.meta.merges}{" "}
          merges turn {data.meta.unique_words} words into a{" "}
          {data.meta.vocab_size}-token vocabulary.
        </RealBadge>
      </div>

      <Beat>
        <p className="mb-4">
          One algorithm handles English, code, and emoji with no language rules.
          Common words survive whole; rare ones shatter into pieces. This matters
          in practice: token count is exactly what you pay for per API call, and
          what has to fit inside a model's context window.
        </p>
        <p className="text-ink-muted">
          Now every token gets an ID — an arbitrary number. But{" "}
          <span className="u-num">4021</span> tells the model nothing about
          meaning. For that, we need embeddings.
        </p>
      </Beat>
    </Act>
  );
}

import { useState } from "react";
import { Act, Beat } from "../Act";
import { Stage, RealBadge } from "../ui/Controls";
import { useArtifact } from "../../lib/data";
import { pct } from "../../lib/viz";

interface Word { word: string; x: number; y: number; group: string }
interface Analogy { expr: string; result: string; top: { word: string; sim: number }[] }
interface Data {
  meta: { sentences: number; vocab_size: number; dim: number };
  words: Word[];
  analogies: Analogy[];
}

const GROUP_COLOR: Record<string, string> = {
  "royal-male": "var(--cat-1)",
  "royal-female": "var(--cat-1)",
  "common-male": "var(--cat-2)",
  "common-female": "var(--cat-2)",
  "royal-place": "var(--cat-6)",
  "common-place": "var(--cat-6)",
};
const isPlace = (g: string) => g.endsWith("place");

function Scatter({ words }: { words: Word[] }) {
  const S = 360, pad = 34;
  const map = (v: number) => pad + ((v + 1) / 2) * (S - pad * 2);
  const at = (w: string) => words.find((d) => d.word === w);
  const arrow = (a: string, b: string) => {
    const p = at(a), q = at(b);
    if (!p || !q) return null;
    return (
      <line x1={map(p.x)} y1={S - map(p.y)} x2={map(q.x)} y2={S - map(q.y)}
        stroke="var(--signal)" strokeWidth={1.5} opacity={0.6} markerEnd="url(#ah)" />
    );
  };

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="w-full" role="img" aria-label="Word embedding space">
      <defs>
        <marker id="ah" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--signal)" />
        </marker>
      </defs>
      {/* parallel gender offsets — why the analogy works */}
      {arrow("man", "woman")}
      {arrow("king", "queen")}
      {words.map((w) => (
        <g key={w.word}>
          <circle cx={map(w.x)} cy={S - map(w.y)} r={isPlace(w.group) ? 2.5 : 4.5}
            fill={GROUP_COLOR[w.group] ?? "var(--cat-6)"} opacity={isPlace(w.group) ? 0.4 : 1} />
          <text x={map(w.x) + 6} y={S - map(w.y) + 3}
            className="u-num" fontSize={isPlace(w.group) ? 8 : 10}
            fill={isPlace(w.group) ? "var(--ink-muted)" : "var(--ink)"}
            opacity={isPlace(w.group) ? 0.55 : 1}>{w.word}</text>
        </g>
      ))}
    </svg>
  );
}

export function Act5Embeddings() {
  const data = useArtifact<Data>("act5-embeddings.json");
  const [ai, setAi] = useState(0);
  if (!data) return <div className="mx-auto h-80 max-w-4xl animate-pulse rounded-2xl bg-paper-sunk" />;

  const analogy = data.analogies[ai];
  const [a, , b, , c] = analogy.expr.split(" ");

  return (
    <Act
      n={5}
      id="act-embeddings"
      kicker="Tokens become meaning"
      title={<>Meaning is a place in space</>}
      lede={
        <p>
          Give every word a list of numbers — a point in high-dimensional space —
          and train it so words used alike land near each other. Nobody labels
          the axes. Structure just emerges from which words keep which company.
          Enough that you can do arithmetic on meaning.
        </p>
      }
    >
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <Stage>
          <p className="u-label mb-2">The learned space (squashed to 2D)</p>
          <Scatter words={data.words} />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <Legend color="var(--cat-1)" label="royalty" />
            <Legend color="var(--cat-2)" label="people" />
            <Legend color="var(--cat-6)" label="context" faded />
          </div>
        </Stage>

        <Stage>
          <p className="u-label mb-3">Arithmetic on meaning</p>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Chip>{a}</Chip><span className="text-ink-muted">−</span>
            <Chip>{b}</Chip><span className="text-ink-muted">+</span>
            <Chip>{c}</Chip><span className="text-ink-muted">=</span>
            <Chip signal>{analogy.result}</Chip>
          </div>
          <div className="space-y-1.5">
            {analogy.top.map((t, i) => (
              <div key={t.word} className="flex items-center gap-3">
                <span className={`u-num w-20 text-sm ${i === 0 ? "text-signal" : "text-ink-muted"}`}>{t.word}</span>
                <div className="h-4 flex-1 overflow-hidden rounded bg-paper">
                  <div className="h-full rounded"
                    style={{ width: `${Math.max(3, t.sim * 100)}%`, background: i === 0 ? "var(--signal)" : "var(--cat-6)", opacity: i === 0 ? 1 : 0.5 }} />
                </div>
                <span className="u-num w-12 text-right text-xs text-ink-muted">{pct(t.sim)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.analogies.map((an, i) => (
              <button key={i} onClick={() => setAi(i)}
                className={["u-num rounded px-2 py-1 text-xs ring-1 transition-colors",
                  i === ai ? "bg-ink text-paper ring-ink" : "ring-hairline hover:ring-signal"].join(" ")}>
                {an.expr}
              </button>
            ))}
          </div>
        </Stage>
      </div>
      <div className="mx-auto mt-4 max-w-4xl">
        <RealBadge>
          Real skip-gram vectors trained for this project ({data.meta.dim}{" "}
          dimensions). The offsets <span className="u-num">king→queen</span> and{" "}
          <span className="u-num">man→woman</span> are parallel — that's why the
          arithmetic lands.
        </RealBadge>
      </div>

      <Beat>
        <p className="mb-4">
          This is “you shall know a word by the company it keeps,” turned into
          geometry. Modern models scale the same idea from single words to whole
          sentences. But a word's meaning still shifts with context — a{" "}
          <span className="u-num">bank</span> by a river isn't a{" "}
          <span className="u-num">bank</span> that holds money.
        </p>
        <p className="text-ink-muted">
          Fixing that needs the piece that made modern AI possible: attention.
        </p>
      </Beat>
    </Act>
  );
}

function Legend({ color, label, faded }: { color: string; label: string; faded?: boolean }) {
  return (
    <span className="u-label inline-flex items-center gap-1.5" style={{ textTransform: "none", opacity: faded ? 0.7 : 1 }}>
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}
function Chip({ children, signal }: { children: React.ReactNode; signal?: boolean }) {
  return (
    <span className={["u-num rounded-md px-2.5 py-1.5 text-sm", signal ? "bg-signal text-paper" : "bg-paper ring-1 ring-hairline"].join(" ")}>
      {children}
    </span>
  );
}

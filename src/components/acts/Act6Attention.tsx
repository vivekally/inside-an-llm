import { useState } from "react";
import { Act, Beat } from "../Act";
import { Stage, RealBadge } from "../ui/Controls";
import { useArtifact } from "../../lib/data";
import { ramp, rampText } from "../../lib/viz";

interface Example { tokens: string[]; layers: { heads: number[][][] }[] }
interface Data { meta: { layers: number; heads: number }; examples: Example[] }

function Heatmap({ tokens, matrix }: { tokens: string[]; matrix: number[][] }) {
  const n = tokens.length;
  const cell = 30;
  const labelW = 62;
  const W = labelW + n * cell + 8;
  const H = labelW + n * cell + 8;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 460 }} role="img" aria-label="Attention heatmap">
      {/* column labels (keys) */}
      {tokens.map((t, j) => (
        <text key={"c" + j} x={labelW + j * cell + cell / 2} y={labelW - 6}
          transform={`rotate(-45 ${labelW + j * cell + cell / 2} ${labelW - 6})`}
          textAnchor="start" className="u-num" fontSize="10" fill="var(--ink-muted)">{t}</text>
      ))}
      {tokens.map((t, i) => (
        <g key={"r" + i}>
          <text x={labelW - 6} y={labelW + i * cell + cell / 2 + 3} textAnchor="end"
            className="u-num" fontSize="10" fill="var(--ink)">{t}</text>
          {tokens.map((_, j) => {
            const v = matrix[i][j];
            const active = j <= i;
            return (
              <g key={j}>
                <rect x={labelW + j * cell} y={labelW + i * cell} width={cell - 2} height={cell - 2} rx={3}
                  fill={active ? ramp(v) : "transparent"}
                  stroke={active ? "none" : "var(--hairline)"} strokeDasharray="2 2" opacity={active ? 1 : 0.3} />
                {active && v > 0.08 && (
                  <text x={labelW + j * cell + cell / 2 - 1} y={labelW + i * cell + cell / 2 + 2}
                    textAnchor="middle" className="u-num" fontSize="8" fill={rampText(v)}>
                    {Math.round(v * 100)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

export function Act6Attention() {
  const data = useArtifact<Data>("act6-attention.json");
  const [ex, setEx] = useState(0);
  const [layer, setLayer] = useState(1);
  const [head, setHead] = useState(0);
  if (!data) return <div className="mx-auto h-96 max-w-2xl animate-pulse rounded-2xl bg-paper-sunk" />;

  const example = data.examples[ex];
  const matrix = example.layers[layer].heads[head];

  return (
    <Act
      n={6}
      id="act-attention"
      kicker="Attention is all you need"
      title={<>Every word looks at every other word</>}
      lede={
        <p>
          The 2017 breakthrough: instead of reading left to right, let each token
          look at all the others at once and pull in what's relevant. A word for
          “what I'm looking for,” a word for “what I offer,” and the match decides
          who listens to whom. This is the engine under every modern LLM.
        </p>
      }
    >
      <div className="mx-auto max-w-2xl">
        <Stage>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {data.examples.map((_, i) => (
              <button key={i} onClick={() => setEx(i)}
                className={["u-label rounded-full px-3 py-1 ring-1", i === ex ? "bg-ink text-paper ring-ink" : "ring-hairline"].join(" ")}
                style={{ textTransform: "none" }}>Sentence {i + 1}</button>
            ))}
            <span className="mx-1 text-hairline">·</span>
            {Array.from({ length: data.meta.layers }).map((_, l) => (
              <button key={l} onClick={() => setLayer(l)}
                className={["u-label rounded px-2.5 py-1 ring-1", l === layer ? "bg-signal text-paper ring-signal" : "ring-hairline"].join(" ")}
                style={{ textTransform: "none" }}>Layer {l + 1}</button>
            ))}
            <span className="mx-1 text-hairline">·</span>
            {Array.from({ length: data.meta.heads }).map((_, h) => (
              <button key={h} onClick={() => setHead(h)}
                className={["u-label rounded px-2.5 py-1 ring-1", h === head ? "bg-signal text-paper ring-signal" : "ring-hairline"].join(" ")}
                style={{ textTransform: "none" }}>Head {h + 1}</button>
            ))}
          </div>
          <div className="flex justify-center overflow-x-auto">
            <Heatmap tokens={example.tokens} matrix={matrix} />
          </div>
          <p className="u-label mt-3" style={{ textTransform: "none" }}>
            Each row is a token; brighter cells are the earlier tokens it pays
            most attention to. Nothing can look ahead (the greyed cells).
          </p>
        </Stage>
        <RealBadge>
          Real attention weights from the tiny transformer trained for this
          project. Switch heads — each one learns to track something different,
          and nobody told it what.
        </RealBadge>
      </div>

      <Beat>
        <p className="mb-4">
          Stack a few of these blocks and the layers specialize: early ones catch
          grammar, later ones catch meaning. That's all “deep learning” means
          here — many simple layers, each refining the last. No hand-written
          rules, just weights tuned until the predictions get good.
        </p>
        <p className="text-ink-muted">
          After all that machinery, the model finally answers the only question
          it ever answers: what token comes next?
        </p>
      </Beat>
    </Act>
  );
}

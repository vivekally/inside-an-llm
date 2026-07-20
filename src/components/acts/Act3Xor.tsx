import { useState } from "react";
import { Act, Beat } from "../Act";
import { Stage, RealBadge } from "../ui/Controls";
import { useArtifact } from "../../lib/data";

interface Net {
  loss_curve: { epoch: number; loss: number }[];
  final_outputs: number[];
  weights: Record<string, number | number[] | number[][]>;
  params: number;
  solved: boolean;
}
interface Data {
  inputs: number[][];
  targets: number[];
  single: Net;
  multi: Net;
}

function LossChart({ single, multi }: { single: Net; multi: Net }) {
  const W = 520, H = 200, pad = 28;
  const maxE = Math.max(...multi.loss_curve.map((d) => d.epoch));
  const maxL = Math.max(...single.loss_curve.map((d) => d.loss), 0.3);
  const x = (e: number) => pad + (e / maxE) * (W - pad * 2);
  const y = (l: number) => pad + (1 - l / maxL) * (H - pad * 2);
  const path = (net: Net) =>
    net.loss_curve.map((d, i) => `${i ? "L" : "M"}${x(d.epoch).toFixed(1)},${y(d.loss).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Training loss curves">
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--hairline)" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--hairline)" />
      <path d={path(single)} fill="none" stroke="var(--cat-6)" strokeWidth={2} strokeDasharray="4 3" />
      <path d={path(multi)} fill="none" stroke="var(--signal)" strokeWidth={2.5} />
      <text x={W - pad} y={y(single.loss_curve[single.loss_curve.length - 1].loss) - 8} textAnchor="end"
        className="u-num" fontSize="11" fill="var(--cat-6)">single-layer (stuck)</text>
      <text x={W - pad} y={y(multi.loss_curve[multi.loss_curve.length - 1].loss) + 16} textAnchor="end"
        className="u-num" fontSize="11" fill="var(--signal)">multi-layer (solved)</text>
      <text x={pad} y={H - 8} className="u-num" fontSize="10" fill="var(--ink-muted)">0</text>
      <text x={W - pad} y={H - 8} textAnchor="end" className="u-num" fontSize="10" fill="var(--ink-muted)">{maxE} epochs</text>
    </svg>
  );
}

export function Act3Xor() {
  const data = useArtifact<Data>("act3-xor-training.json");
  const [which, setWhich] = useState<"single" | "multi">("multi");
  if (!data) return <ActShell />;

  const net = data[which];
  const weightNums = flattenWeights(net.weights);

  return (
    <Act
      n={3}
      id="act-xor"
      kicker="A model is a file"
      title={<>A “model” is just a list of numbers</>}
      lede={
        <p>
          Strip away the mystique and a neural network is a set of weights,
          tuned by repetition until its output is right. Here are two, learning
          the XOR problem that stumped early AI. One can't solve it. One can. The
          difference is a hidden layer and an algorithm called backpropagation.
        </p>
      }
    >
      <div className="mx-auto max-w-2xl">
        <Stage>
          <div className="mb-4 flex gap-2">
            {(["single", "multi"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setWhich(k)}
                className={[
                  "u-label rounded-full px-4 py-1.5 ring-1 transition-colors",
                  which === k ? "bg-ink text-paper ring-ink" : "ring-hairline hover:ring-signal",
                ].join(" ")}
                style={{ textTransform: "none" }}
              >
                {k === "single" ? "Single-layer" : "Multi-layer"}
              </button>
            ))}
          </div>

          <LossChart single={data.single} multi={data.multi} />

          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="u-label mb-2">Its answers</p>
              <table className="u-num w-full text-sm">
                <tbody>
                  {data.inputs.map((inp, i) => {
                    const out = net.final_outputs[i];
                    const ok = Math.round(out) === data.targets[i];
                    return (
                      <tr key={i}>
                        <td className="py-0.5 text-ink-muted">{inp[0]}, {inp[1]}</td>
                        <td className="py-0.5">→ {out.toFixed(2)}</td>
                        <td className="py-0.5" style={{ color: ok ? "var(--cat-3)" : "var(--signal)" }}>
                          {ok ? "✓" : "✗"} want {data.targets[i]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div>
              <p className="u-label mb-2">The whole model file · {net.params} numbers</p>
              <div className="flex flex-wrap gap-1">
                {weightNums.map((w, i) => (
                  <span key={i} className="u-num rounded bg-paper px-1.5 py-0.5 text-xs ring-1 ring-hairline">
                    {w >= 0 ? "+" : ""}{w.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Stage>
        <RealBadge>
          Both nets were trained for real (5,000 epochs of backpropagation). The
          single-layer's entire brain is {data.single.params} numbers; the
          multi-layer's is {data.multi.params}.
        </RealBadge>
      </div>

      <Beat>
        <p className="mb-4">
          That's the reveal: when people say a model “has 120 billion
          parameters,” they mean a file with 120 billion numbers like these,
          tuned by the same trick — predict, measure the error, nudge every
          number to be a little less wrong, repeat billions of times.
        </p>
        <p className="text-ink-muted">
          But a network only eats numbers, and your prompt is text. So the next
          job is turning words into numbers. That starts with tokens.
        </p>
      </Beat>
    </Act>
  );
}

function flattenWeights(w: Record<string, number | number[] | number[][]>): number[] {
  const out: number[] = [];
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (typeof v === "number") out.push(v);
  };
  Object.values(w).forEach(walk);
  return out;
}

function ActShell() {
  return <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-2xl bg-paper-sunk" />;
}

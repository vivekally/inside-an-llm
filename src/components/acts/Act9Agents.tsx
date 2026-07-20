import { Act, Beat } from "../Act";
import { Stage } from "../ui/Controls";

const LOOP = [
  { tag: "Model", text: "outputs a structured tool call — just JSON: get_weather(\"Toronto\")" },
  { tag: "Harness", text: "the app around the model sees the call and actually runs it" },
  { tag: "Result", text: "the answer (14°C, rain) is appended to the conversation" },
  { tag: "Model", text: "reads the result and writes a real reply" },
];

const FRONTIER = [
  { name: "Reasoning modes", text: "let the model think in a scratchpad before answering — spend more compute at test time for harder problems." },
  { name: "Mixture of experts", text: "route each token through a few specialized sub-networks instead of the whole model, for scale without the full cost." },
  { name: "Retrieval (RAG)", text: "look things up in a database first and paste the findings into the context, so answers can cite fresh, specific facts." },
];

export function Act9Agents() {
  return (
    <Act
      n={9}
      id="act-agents"
      kicker="Tools, agents, and beyond"
      title={<>The model can't act. So it asks.</>}
      lede={
        <p>
          A model only emits tokens — it can't browse the web or run your code.
          The trick is to let it emit a <span className="u-num">tool call</span>{" "}
          and have the software around it do the work, then feed the result back.
          That loop is what makes an “agent.”
        </p>
      }
    >
      <div className="mx-auto max-w-3xl">
        <Stage>
          <ol className="space-y-3">
            {LOOP.map((s, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="u-num mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal text-sm text-paper">
                  {i + 1}
                </span>
                <p>
                  <span className="u-label mr-2 text-signal" style={{ textTransform: "none" }}>{s.tag}</span>
                  <span className="text-ink-muted">{s.text}</span>
                </p>
              </li>
            ))}
          </ol>
          <p className="u-label mt-5 flex items-center gap-2" style={{ textTransform: "none" }}>
            <span aria-hidden className="text-signal">↻</span>
            the loop repeats — that's an agent doing multi-step work
          </p>
        </Stage>

        <div className="mt-10">
          <p className="u-label mb-4 text-center">Where it's heading</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {FRONTIER.map((f) => (
              <div key={f.name} className="rounded-xl border border-hairline p-4">
                <p className="u-display mb-1.5 text-lg">{f.name}</p>
                <p className="text-sm text-ink-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Beat>
        <p className="mb-4">
          And that's the whole machine — from a bag of if-statements to tokens,
          embeddings, attention, and a dice roll, wrapped in training and tools.
          No step is magic. Every one is just numbers, tuned until the output is
          useful.
        </p>
        <p className="text-ink-muted">
          The transformer is the architecture of this moment, not the last word.
          A single fifteen-page paper powers a trillion-dollar industry — and the
          next shift might be one more paper away.
        </p>
      </Beat>
    </Act>
  );
}

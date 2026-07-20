import { Act, Beat } from "../Act";
import { Stage } from "../ui/Controls";

const STAGES = [
  {
    tag: "Stage 1 · Pretraining",
    head: "Read (almost) everything",
    body: "Predict the next token across petabytes of text — the web, books, code, forums. The result is a brilliant autocomplete that has no idea it's supposed to be helpful.",
    out: "a fancy autocomplete",
  },
  {
    tag: "Stage 2 · Fine-tuning",
    head: "Learn the shape of an answer",
    body: "Keep training, now on curated question-and-answer pairs written in the style you want back. The weights shift from “continue the text” toward “respond like an assistant.”",
    out: "a chatbot",
  },
  {
    tag: "Stage 3 · RLHF",
    head: "Get ranked by humans",
    body: "People rate responses good or bad; the model is nudged toward the good ones. What counts as “good” is decided by the company and its raters — this is where an LLM's manners come from.",
    out: "an aligned assistant",
  },
];

export function Act8Assistant() {
  return (
    <Act
      n={8}
      id="act-assistant"
      kicker="From autocomplete to assistant"
      title={<>Three trainings turn a parrot into an assistant</>}
      lede={
        <p>
          Everything so far was pretraining: a model that just continues text.
          Getting from there to something that answers your questions takes two
          more passes, each reshaping the same pile of weights.
        </p>
      }
    >
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-4 md:grid-cols-3">
          {STAGES.map((s, i) => (
            <div key={i} className="relative">
              <Stage>
                <p className="u-label mb-3 text-signal">{s.tag}</p>
                <h3 className="u-display mb-3 text-xl">{s.head}</h3>
                <p className="text-[0.95rem] text-ink-muted">{s.body}</p>
                <p className="u-label mt-4" style={{ textTransform: "none" }}>
                  → produces <span className="text-ink">{s.out}</span>
                </p>
              </Stage>
              {i < STAGES.length - 1 && (
                <div aria-hidden className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-signal md:block">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Stage machine>
            <div className="flex flex-col items-center gap-3 py-2 text-center sm:flex-row sm:justify-center sm:gap-6">
              <span className="u-num text-sm" style={{ color: "var(--machine-fg)" }}>
                petabytes of human text
              </span>
              <span aria-hidden className="text-signal">⟶</span>
              <span className="u-display text-2xl">one weights file</span>
              <span aria-hidden className="text-signal">⟶</span>
              <span className="u-num text-sm" style={{ color: "var(--machine-fg)" }}>
                a few hundred gigabytes
              </span>
            </div>
          </Stage>
        </div>
      </div>

      <Beat>
        <p className="text-ink-muted">
          Even now it's still just a weights file on a server, producing one token
          at a time. It can't check today's date or run your code. For that, it
          needs a way to reach outside itself.
        </p>
      </Beat>
    </Act>
  );
}

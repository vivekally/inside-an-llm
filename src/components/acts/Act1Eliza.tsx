import { useEffect, useRef, useState } from "react";
import { Act, Beat } from "../Act";
import { Stage, RealBadge } from "../ui/Controls";
import { useInView } from "../../lib/useInView";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { elizaReply, demoConversation, type Turn } from "../../lib/eliza";

export function Act1Eliza() {
  const reduced = useReducedMotion();
  const [stageRef, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const demo = demoConversation();

  const [shown, setShown] = useState<Turn[]>(reduced ? demo : []);
  const [live, setLive] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (reduced || !inView || started.current) return;
    started.current = true;
    let i = 0;
    const tick = () => {
      setShown(demo.slice(0, i + 1));
      i += 1;
      if (i < demo.length) setTimeout(tick, demo[i].who === "bot" ? 700 : 950);
    };
    tick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [shown, live]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    setLive((l) => [...l, { who: "you", text: t }, { who: "bot", text: elizaReply(t, l.length) }]);
    setInput("");
  }

  const convo = [...shown, ...live];

  return (
    <Act
      n={1}
      id="act-eliza"
      kicker="Chatbots before LLMs"
      title={<>It started with a bag of if-statements</>}
      lede={
        <p>
          In 1966, a program called ELIZA convinced people it understood them.
          It didn't. It matched patterns and echoed your words back. Same chat
          box as today, a completely different machine underneath. Here's one,
          running for real.
        </p>
      }
    >
      <div ref={stageRef} className="mx-auto max-w-xl">
        <Stage machine>
          <p className="u-label mb-3" style={{ color: "var(--machine-fg)", opacity: 0.6 }}>
            ELIZA · a rule-based therapist
          </p>
          <div ref={scrollRef} className="h-72 space-y-3 overflow-y-auto pr-1">
            {convo.map((t, i) => (
              <div key={i} className={t.who === "you" ? "text-right" : "text-left"}>
                <span
                  className={[
                    "inline-block max-w-[85%] rounded-2xl px-3.5 py-2 text-[0.95rem]",
                    t.who === "you"
                      ? "bg-signal text-paper"
                      : "border border-machine-line text-machine-fg",
                  ].join(" ")}
                >
                  {t.text}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try: I feel stuck at work"
              className="min-w-0 flex-1 rounded-full border border-machine-line bg-transparent px-4 py-2 text-[0.95rem] text-machine-fg outline-none placeholder:text-machine-fg/40 focus:border-signal"
            />
            <button
              type="submit"
              className="u-label rounded-full bg-signal px-4 py-2 text-paper"
              style={{ textTransform: "uppercase" }}
            >
              Send
            </button>
          </form>
        </Stage>
        <RealBadge>
          A real rule engine (~40 lines). Every reply is an if-statement firing
          on your words — no learning, no meaning.
        </RealBadge>
      </div>

      <Beat>
        <p className="mb-4">
          Weizenbaum's own secretary asked him to leave the room so she could
          talk to it privately. That pull is old. What changed between ELIZA and
          ChatGPT isn't a better script, it's a completely different mechanism.
        </p>
        <p className="text-ink-muted">
          Think of the chat box as a black box: text goes in, text comes out. For
          the rest of this piece we'll swap what's inside that box for something
          that actually learns. Step one: teach it that language is predictable.
        </p>
      </Beat>
    </Act>
  );
}

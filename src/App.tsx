import { Hero } from "./components/Hero";
import { Section } from "./components/Section";
import { Footer } from "./components/Footer";
import { ProgressRail } from "./components/ProgressRail";
import { Act1Eliza } from "./components/acts/Act1Eliza";
import { Act2Shannon } from "./components/acts/Act2Shannon";
import { Act3Xor } from "./components/acts/Act3Xor";
import { Act4Bpe } from "./components/acts/Act4Bpe";
import { Act5Embeddings } from "./components/acts/Act5Embeddings";

export default function App() {
  return (
    <main>
      <ProgressRail />
      <Hero />

      <Section id="intro">
        <div className="u-measure">
          <p className="u-label mb-6">The plan</p>
          <h2 className="u-display mb-8 text-[clamp(1.8rem,4vw,3rem)]">
            Nine steps from a bag of if-statements to a machine that writes.
          </h2>
          <p className="mb-6">
            Every stage here is real. I trained tiny models from scratch — a
            neural net, a tokenizer, a word-embedding model, and a small
            transformer — and wired their actual output into the diagrams you're
            about to scroll through. Nothing on this page is a mock-up. When you
            see a probability, a weight, or a loss curve, it came out of a model
            that really ran.
          </p>
          <p className="text-ink-muted">
            No maths background needed. We'll build the intuition one piece at a
            time.
          </p>
        </div>
      </Section>

      <Act1Eliza />
      <Act2Shannon />
      <Act3Xor />
      <Act4Bpe />
      <Act5Embeddings />

      <Section machine>
        <div className="u-measure text-center">
          <p className="u-label mb-6" style={{ color: "var(--machine-fg)", opacity: 0.7 }}>
            Halfway · the engine room next
          </p>
          <p className="u-display text-[clamp(1.4rem,3vw,2.25rem)]">
            You've got tokens turned into meaning. Next comes the machine that
            reads them all at once and decides what to say — attention, sampling,
            and the leap from autocomplete to assistant. Being built now.
          </p>
        </div>
      </Section>

      <Footer />
    </main>
  );
}

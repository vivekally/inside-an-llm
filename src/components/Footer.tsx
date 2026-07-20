export function Footer() {
  return (
    <footer className="border-t border-hairline px-6 py-16">
      <div className="u-measure">
        <p className="u-label mb-6">Credits &amp; sources</p>
        <p className="mb-4 text-ink-muted">
          Built by{" "}
          <a
            className="text-ink underline decoration-signal decoration-2 underline-offset-4"
            href="https://github.com/vivekally"
          >
            Vivek Dangi
          </a>
          . The narrative spine follows CJ's walkthrough{" "}
          <a
            className="text-ink underline decoration-signal decoration-2 underline-offset-4"
            href="https://www.youtube.com/watch?v=YmLp8qe87A0"
          >
            “I Built an LLM From Scratch”
          </a>{" "}
          (Syntax). The scrollytelling format takes inspiration from the{" "}
          <a
            className="text-ink underline decoration-signal decoration-2 underline-offset-4"
            href="https://ig.ft.com/generative-ai/"
          >
            Financial Times' 2023 explainer
          </a>
          . No code, text, or visuals are reused from either — the models,
          diagrams, and words here are original.
        </p>
        <p className="u-label mt-8" style={{ textTransform: "none" }}>
          MIT licensed · source on{" "}
          <a
            className="underline decoration-hairline underline-offset-4"
            href="https://github.com/vivekally/inside-an-llm"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}

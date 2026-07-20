# Concept map — "I Built an LLM From Scratch" (Syntax, CJ)

Source: https://www.youtube.com/watch?v=YmLp8qe87A0 (~52 min). Timestamps link into the
video (`&t=XmYs`). Every concept below is demonstrated with **real working code** — CJ links
the repo in the video description, which is the raw material that makes this explainer
different from a purely illustrative one.

## 1. Framing: language is predictable — [00:00–01:34]
- Shannon's 1950 guessing game with Betty Shannon: given enough context, the next letter
  is nearly certain → language has deep statistical structure.
- LLMs are statistical models of language; "next-token predictor" is true but hides a
  huge amount of machinery.

## 2. Chatbots before LLMs (rule-based era) — [01:34–07:12]
- 1950 Turing test → 1966 ELIZA (Weizenbaum, Rogerian therapist, pure pattern matching)
  → 1972 PARRY (Colby, simulated paranoia; fooled psychiatrists; ELIZA and PARRY were
  connected to talk to each other) → 1995 ALICE (41,000 handwritten patterns) → 2001
  SmarterChild on AIM.
- The ELIZA effect: Weizenbaum's secretary asked for privacy to talk to it — people
  bond with a bag of if-statements. Direct echo of people treating ChatGPT as a therapist.
- **Code demo:** an ELIZA-style chatbot ("I feel X" → "Why do you feel X?", catch-all
  responses). Same chat UI as ChatGPT, radically different mechanism.
- Key mental model: chat is a black box (input → process → output); the whole video is
  swapping ever-smarter machinery into that box.

## 3. What a model actually is — [07:59–15:15]
- A model = a neural network = a **file of weights**. Nothing more.
- History: McCulloch & Pitts 1943 (neurons as logic gates) → Rosenblatt's perceptron
  1958 (room-sized machine; NYT hype) → Minsky & Papert 1969 (single layer can't do
  XOR) → backpropagation 1986 (Rumelhart, Hinton, Williams) — every modern model still
  trains with a variant of it.
- **Code demo:** XOR neural net. Single-layer never converges; multi-layer solves it by
  ~800 iterations. The trained single-layer "model file" is literally three numbers
  (2 weights + 1 bias). Training loop: predict → measure error → compute delta via
  derivative → nudge weights → repeat 5,000 epochs.

## 4. Tokenization (BPE) — [16:03–21:37]
- Token = smallest unit the model sees; not words, not characters. Spaces and newlines
  are tokens; emoji can be several.
- BPE invented 1994 (Philip Gage) as *data compression*; repurposed 2015 (Sennrich,
  Haddow, Birch) to learn vocabularies for neural translation. One algorithm handles
  English, Japanese, code, emoji.
- Practical stakes: token count = API cost, and what fits in the context window.
- **Code demo:** BPE trainer — shows each merge step; frequency-weighted pair merging;
  max-merges budget controls vocab size. Bee Movie script → 2,088 tokens; shrink the
  budget and "according" splits into 4 sub-word tokens.

## 5. Embeddings — [21:37–30:28]
- Token IDs are arbitrary; meaning comes from **where words appear**. Frege 1884
  (context principle) → Firth 1957 ("know a word by the company it keeps") →
  distributional semantics.
- word2vec (Mikolov, Google, 2013): king − man + woman ≈ queen. Structure nobody
  programmed, emergent from co-occurrence statistics.
- A vector = a point in high-dimensional space. word2vec used 300 dims; GPT-3 uses
  12,288. Similarity measured by cosine similarity (angle between vectors).
- **Code demo:** skip-gram word2vec trained live on ~107 hand-written sentences.
  Window-size pairing (3,970 training pairs), push related vectors together / unrelated
  apart each epoch. Word math works: kitten − cat + dog ≈ puppy. Weights file =
  vocabulary + one 32-dim vector per word.
- Modern embedding models: same idea scaled from words to sentences/paragraphs.

## 6. The transformer — [30:28–41:42]
- The problem: LSTMs read one word at a time (slow); attention (Bahdanau, Cho, Bengio
  2014) was bolted on to help long sentences. 2017: Uszkoreit proposes dropping
  recurrence entirely → "Attention Is All You Need" (8 equal authors, all since left
  Google, several founded billion-dollar companies; 15-page public PDF).
- A transformer block = **attention** (tokens exchange information) + **feed-forward**
  (each token processed alone). At hardware level it's almost entirely matrix multiplication.
- Self-attention: each token's embedding produces query ("what I'm looking for"),
  key ("what I offer"), value ("what gets passed on"). "Bank of the river" vs "bank to
  deposit money" — same word in, different vector out.
- Multi-head attention: many parallel Q/K/V sets; heads *specialize emergently*
  (pronouns, tense, position) — nobody assigns their jobs.
- Stacked layers: early ≈ syntax, middle ≈ meaning, late ≈ reasoning. "Deep learning"
  = many stacked layers.
- **Code demo:** a 6-layer, 52,000-parameter transformer trained on ~30 children's
  stories (context window: 32 tokens; ~1.5 h on a MacBook CPU). Weights file contains
  vocab + merges, embedding + positional weights, and per-block Q/K/V + feed-forward
  weights. Contrast: GPT-OSS-120B has 120 billion parameters.

## 7. Sampling & generation — [41:42–44:53]
- Model output is not a token — it's **logits** → softmax → a probability distribution
  over the whole vocabulary.
- Temperature (0 = deterministic, 1.5 = chaotic) and top-p (probability-mass cutoff)
  shape sampling; that's why the same prompt gives different answers.
- Autoregressive generation: sample one token, append, run the whole stack again.
  "The model has no plan" — coherent paragraphs emerge one blind step at a time.

## 8. What production chat actually sends — [43:19–44:53]
- The model sees a structured package: system prompt (provider's hidden instructions) +
  full conversation history + your latest message. **Zero memory between requests** —
  the history *is* the memory.
- Context windows: 32 tokens in the toy model; 100k–millions in production. Long
  conversations degrade — attention spreads thinner, instructions get lost, hallucination
  risk rises.

## 9. From autocomplete to assistant — [44:53–48:30]
- Pretraining data: Common Crawl (petabytes, archiving the web since 2008), Wikipedia,
  Reddit, GitHub, books, papers — "and a lot of copyrighted material."
- Pretraining alone produces "really fancy autocomplete."
- Fine-tuning: second pass over question–answer pairs → chatbot-style responses.
- RLHF: hired humans rank responses; what counts as "good" is decided by the company
  and its raters.
- Tool calling / agents: tool descriptions go into context; model is fine-tuned to emit
  a structured JSON "call this tool" output; a **harness** (editor, desktop app) executes
  it and appends the result to the history. The model never touches the outside world itself.
- Name-checked but not covered: mixture of experts, thinking/reasoning modes.

## 10. Closing arc — [48:30–51:18]
- Dartmouth 1956: the coining of "artificial intelligence"; they thought one summer
  would crack it. 70 years later a single 15-page paper powers a trillion-dollar industry.
- The transformer is "the architecture of the current moment," not necessarily the last.
- CJ's take: LLMs are sophisticated pattern-matching autocomplete, trained only on text —
  better described as "alien intelligence" than artificial human intelligence.

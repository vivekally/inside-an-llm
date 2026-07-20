# Gap analysis — FT "Generative AI" explainer (2023) vs. Syntax podcast (2026)

Goal: an **original** scrollytelling explainer in the spirit of
https://ig.ft.com/generative-ai/ ("Generative AI exists because of the transformer",
FT, Sept 2023) that covers the same foundations and extends them with the material from
the Syntax video (research/concept-map.md). We do not reuse FT text, visuals, or code —
format inspiration only.

FT-side coverage below is based on the piece's known 2023 structure (the page blocks
automated fetching): word embeddings in an animated vector space, self-attention
resolving ambiguous words, transformers processing whole sequences in parallel,
next-token probability generation, hallucination, and a short close on capability/risk.

## Coverage comparison

| Concept | FT 2023 | Syntax 2026 | Opportunity for our explainer |
|---|---|---|---|
| History of chatbots (ELIZA → SmarterChild) | — | ✅ rich arc | Opening act: playable ELIZA next to a real LLM — same UI, different machinery |
| What a "model" literally is (weights file) | — | ✅ XOR demo, "3 numbers" | Demystifying beat FT never had: show an actual weights file |
| Neural net history (perceptron → backprop) | — | ✅ | Timeline interlude; keeps the "80 years of research" thread |
| Tokenization / BPE mechanics | brief mention | ✅ live merges | **Live tokenizer widget** — type anything, watch it split; show cost/context stakes |
| Embeddings / vector space | ✅ signature 3D visual | ✅ trains word2vec live | Ours: interactive word-math (king − man + woman) on a real trained model |
| Self-attention / context | ✅ ambiguous-word demo | ✅ Q/K/V level | Go one level deeper than FT: Q/K/V + attention heatmap |
| Multi-head + stacked layers | light | ✅ heads specialize | Layer-by-layer scroll animation (syntax → meaning → reasoning) |
| Training loop / loss curves | — | ✅ real loss output | Animated loss-descent replay from a real training run |
| Logits → softmax → sampling | probabilities shown | ✅ temperature + top-p | **Temperature/top-p sliders** on a live next-token bar chart |
| Autoregressive loop | ✅ implied | ✅ explicit "no plan" | Token-by-token generation animation |
| System prompt + history + context window | — | ✅ | "What the model actually sees" panel; long-context degradation |
| Pretraining data (Common Crawl etc.) | partial | ✅ | Scale visual: petabytes → one weights file |
| Fine-tuning + RLHF | brief | ✅ pipeline | 3-stage pipeline graphic: pretrain → SFT → RLHF |
| Hallucination | ✅ | implied | Keep; explain via sampling + context, not magic |
| Tool calling / agents | — (predates) | ✅ harness loop | **The big post-2023 addition** — model emits JSON, harness executes |
| Reasoning / thinking modes | — | name-checked only | Add from other sources (test-time compute) — 2026 must-have |
| Mixture of experts | — | name-checked only | Optional "under the hood of frontier models" aside |
| RAG / retrieval | — | — | Optional; pairs naturally with the context-window section |

## What makes ours different from FT's

1. **Everything is real, not illustrative.** The Syntax video's from-scratch code means
   every widget can run a genuine tiny model in the browser (or replay genuine training
   artifacts): a real BPE tokenizer, real 32-dim embeddings, a real 52k-param
   transformer's probability outputs. FT's animations were hand-crafted illustrations.
2. **The story extends past 2023.** FT stops at "it predicts tokens, sometimes wrongly."
   We continue: instruction tuning → RLHF → tool calling/agents → reasoning modes —
   i.e., how autocomplete became the assistants people actually use in 2026.
3. **The history spine.** Shannon 1950 → Dartmouth 1956 → ELIZA 1966 → perceptron/
   backprop → word2vec 2013 → transformer 2017 → now. Scrollytelling loves a timeline.

## Proposed site outline (9 acts)

1. **You type, it answers** — playable ELIZA vs. LLM; the black-box framing.
2. **Language is predictable** — Shannon's guessing game as an interactive.
3. **A model is a file** — XOR net trains before your eyes; weights-file reveal.
4. **Words become tokens** — live BPE tokenizer, cost/context stakes.
5. **Tokens become meaning** — embedding space explorer + word math.
6. **Attention is all you need** — Q/K/V, heatmap, layer stack scroll.
7. **One token at a time** — softmax bar chart, temperature/top-p sliders,
   autoregressive loop animation.
8. **From autocomplete to assistant** — pretraining data scale, SFT, RLHF.
9. **Beyond the next token** — tools/agents harness loop; reasoning modes; "the
   transformer is the architecture of the current moment."

## Open decisions (for /spec)

- Live in-browser model (transformers.js / ONNX tiny model) vs. pre-recorded artifacts
  (JSON replays of training runs). Live is more magical; replays are lighter and can't fail.
- Reuse CJ's linked repo code as reference implementations (check its license first) vs.
  reimplement the demos.
- Stack: static scrollytelling site (plain HTML + Svelte/vanilla + scroll-driven
  animations) vs. Next.js like other projects; deploy target Vercel either way.
- Scope of post-2023 material: tools/agents is in the video; reasoning modes and MoE
  need outside sourcing.

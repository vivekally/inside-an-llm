# Inside an LLM

A scrollytelling visual explainer of how large language models work, from keystroke to answer.

**Live site (once built):** https://vivekally.github.io/inside-an-llm/

Nine acts, each backed by a replay widget driven by data from tiny models trained for this project (XOR net, BPE tokenizer, skip-gram embeddings, a small from-scratch transformer). No faked numbers: every chart replays a real training run.

Status: **live** — all nine acts built. See issue #1 for the spec.

## Develop

```sh
npm install
npm run dev      # http://localhost:5174/inside-an-llm/
npm run build    # -> dist/ (deployed to Pages by .github/workflows/deploy.yml)
```

## Regenerate the data

Every number the site shows comes from `scripts/` (Python + numpy, seeded, no ML
libraries). To rebuild the JSON artifacts in `public/data/`:

```sh
pip install -r scripts/requirements.txt
python3 scripts/run_all.py       # Shannon, XOR, BPE, embeddings, transformer
python3 scripts/make_og.py       # social share image
```

The transformer's forward/backward pass (`scripts/transformer.py`) is
gradient-checked. Word2vec analogies (king − man + woman = queen) come from a
genuinely trained skip-gram model.

## Research

- [Concept map](research/concept-map.md) of the source material
- [Gap analysis](research/gap-analysis.md) vs the FT 2023 explainer, with the 9-act outline

## Credits

- Content spine: ["I Built an LLM From Scratch"](https://www.youtube.com/watch?v=YmLp8qe87A0) by CJ (Syntax)
- Format inspiration: [FT's transformer explainer](https://ig.ft.com/generative-ai/) (2023)

No code or text is reused from either source.

## License

MIT

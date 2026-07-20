"""Act 4 — Words become tokens.

A from-scratch byte-pair-encoding tokenizer. Starts from characters and
repeatedly merges the most frequent adjacent pair, exactly like the real thing.
Records every merge step and the final vocabulary so the site can animate the
vocabulary being built from the ground up.
"""

import re
from collections import Counter

from corpus import STORIES
from _util import write_artifact

WORD_RE = re.compile(r"[a-z]+")


def word_freqs(texts):
    words = []
    for t in texts:
        words += WORD_RE.findall(t.lower())
    return Counter(words)


def train(texts, max_merges=60):
    freqs = word_freqs(texts)
    # each word -> list of symbols, starting as characters + end marker
    corpus = {tuple(list(w) + ["</w>"]): c for w, c in freqs.items()}

    merges = []
    for step in range(max_merges):
        pair_counts = Counter()
        for symbols, c in corpus.items():
            for i in range(len(symbols) - 1):
                pair_counts[(symbols[i], symbols[i + 1])] += c
        if not pair_counts:
            break
        (a, b), cnt = pair_counts.most_common(1)[0]
        if cnt < 2:
            break
        merged = a + b
        new_corpus = {}
        for symbols, c in corpus.items():
            out = []
            i = 0
            while i < len(symbols):
                if i < len(symbols) - 1 and symbols[i] == a and symbols[i + 1] == b:
                    out.append(merged)
                    i += 2
                else:
                    out.append(symbols[i])
                    i += 1
            new_corpus[tuple(out)] = c
        corpus = new_corpus
        merges.append(
            {
                "step": step + 1,
                "pair": [a, b],
                "token": merged.replace("</w>", "_"),
                "count": cnt,
            }
        )

    # final vocabulary = all symbols present after merging
    vocab = Counter()
    for symbols, c in corpus.items():
        for s in symbols:
            vocab[s] += c
    vocab_tokens = sorted(vocab.keys(), key=lambda s: (-vocab[s], s))
    display = [v.replace("</w>", "_") for v in vocab_tokens]

    # a couple of example words shown as their final token split
    examples = []
    for w in ["castle", "princess", "river", "kingdom", "golden"]:
        if w in freqs:
            key = next((k for k in corpus if "".join(k).replace("</w>", "") == w), None)
            if key:
                examples.append(
                    {"word": w, "tokens": [s.replace("</w>", "_") for s in key]}
                )
    return merges, display, examples, len(freqs)


def build():
    merges, vocab, examples, n_words = train(STORIES, max_merges=60)
    obj = {
        "meta": {
            "sentences": len(STORIES),
            "unique_words": n_words,
            "merges": len(merges),
            "vocab_size": len(vocab),
            "note": "Real BPE run on this project's story corpus.",
        },
        "merges": merges,
        "vocab": vocab,
        "examples": examples,
    }
    write_artifact("act4-bpe-merges.json", obj)
    print(f"  {len(merges)} merges, vocab {len(vocab)}, from {n_words} words")


if __name__ == "__main__":
    print("act4 bpe:")
    build()

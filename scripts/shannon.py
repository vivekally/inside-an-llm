"""Act 2 — Shannon's guessing game.

Builds a letter-level bigram-context model from the original PROSE + STORIES
corpus and records, for a set of contexts, the real probability distribution
over the next letter. This is exactly what Shannon measured in 1950: given some
context, how predictable is the next letter?
"""

from collections import Counter, defaultdict

from corpus import PROSE, STORIES
from _util import write_artifact, r

ALPHA = "abcdefghijklmnopqrstuvwxyz "


def clean(s):
    return "".join(c for c in s.lower() if c in ALPHA)


def build():
    text = " ".join(clean(s) for s in PROSE + STORIES)

    # context of length 2 -> next char
    ctx2 = defaultdict(Counter)
    for i in range(len(text) - 2):
        ctx2[text[i : i + 2]][text[i + 2]] += 1

    # single-char frequency (overall predictability baseline)
    freq = Counter(text)
    total = sum(freq.values())

    def dist(ctx, top=8):
        counts = ctx2[ctx]
        n = sum(counts.values())
        items = counts.most_common(top)
        return n, [{"ch": ch, "p": c / n} for ch, c in items]

    # Contexts chosen to show the range: near-certain ("th"->e) to wide-open.
    contexts = ["th", "qu", "in", "er", "he", "an", "wh", "st", "on", "ea"]
    examples = []
    for ctx in contexts:
        n, probs = dist(ctx)
        if n < 3:
            continue
        examples.append(
            {
                "context": ctx,
                "count": n,
                "next": probs,
                "top": probs[0]["ch"] if probs else "",
                "top_p": probs[0]["p"] if probs else 0.0,
            }
        )

    alphabet_freq = [
        {"ch": ch, "p": freq[ch] / total}
        for ch, _ in freq.most_common()
        if ch != " "
    ]

    obj = {
        "meta": {
            "sentences": len(PROSE + STORIES),
            "chars": len(text),
            "note": "Real letter statistics from this project's original prose corpus.",
        },
        "examples": r(examples),
        "alphabet_freq": r(alphabet_freq),
    }
    write_artifact("act2-letter-probs.json", obj)


if __name__ == "__main__":
    print("act2 shannon:")
    build()

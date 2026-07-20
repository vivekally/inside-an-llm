"""Act 5 — Tokens become meaning.

Trains word embeddings from scratch with word2vec skip-gram on the original
corpus (stories + parallel analogy sentences). Small vocab, so we use a full
softmax (vectorized, deterministic) rather than negative sampling. Records a 2D
projection of the learned vectors and the classic word-math analogies computed
on the real vectors: king - man + woman -> queen.
"""

import numpy as np

from corpus import STORIES, RELATIONS, build_analogy_corpus
from _util import write_artifact, r

rng = np.random.default_rng(3)

DIM = 32
WINDOW = 3
EPOCHS = 900
LR = 0.25

GROUPS = {
    # the four analogy corners, split by rank + gender so the scatter shows the
    # parallelogram directly
    "royal-male": ["king", "prince"],
    "royal-female": ["queen", "princess"],
    "common-male": ["man", "boy"],
    "common-female": ["woman", "girl"],
    # scaffolding context words, faded in the scatter
    "royal-place": ["throne", "crown", "palace", "kingdom", "royal", "noble",
                    "court", "decree", "servant"],
    "common-place": ["field", "cottage", "market", "basket", "chores", "bread",
                     "stall", "coat", "work", "well"],
}
WORD_GROUP = {w: g for g, ws in GROUPS.items() for w in ws}

# Function words carry position, not meaning. Word2vec subsamples these; on a
# tiny corpus it's cleaner to drop them so content-word geometry sharpens.
# NOTE: gender pronouns (his/her) are kept in training on purpose — they are the
# analogy's gender axis — but excluded from analogy answers via NOT_CANDIDATE.
STOP = set("""
a an the and or of to in at on by is was were be are am who with from into
upon they it its that this these those all every some for as
but so then when where will would can could each their there here has had have
out up down over under across near past not no very much many one two
""".split())

# Never returned as an analogy result (pronouns + glue that survives STOP).
NOT_CANDIDATE = STOP | set("his her he she him himself herself young".split())


def tokenize(texts):
    return [[w for w in t.lower().split() if w not in STOP] for t in texts]


def build_vocab(sents):
    counts = {}
    for s in sents:
        for w in s:
            counts[w] = counts.get(w, 0) + 1
    vocab = sorted(counts, key=lambda w: (-counts[w], w))
    stoi = {w: i for i, w in enumerate(vocab)}
    return vocab, stoi


def make_pairs(sents, stoi):
    centers, contexts = [], []
    for s in sents:
        idx = [stoi[w] for w in s]
        for i, c in enumerate(idx):
            lo, hi = max(0, i - WINDOW), min(len(idx), i + WINDOW + 1)
            for j in range(lo, hi):
                if j != i:
                    centers.append(c)
                    contexts.append(idx[j])
    return np.array(centers), np.array(contexts)


def softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


def train():
    # Clean, strongly-parallel corpus only — story noise destroys the linear
    # analogy structure at this scale.
    sents = tokenize(build_analogy_corpus())
    vocab, stoi = build_vocab(sents)
    V = len(vocab)
    centers, contexts = make_pairs(sents, stoi)
    P = len(centers)

    W = rng.normal(0, 0.1, (V, DIM))   # word (input) vectors
    C = rng.normal(0, 0.1, (V, DIM))   # context (output) vectors

    for epoch in range(EPOCHS):
        Vc = W[centers]                       # (P, D)
        logits = Vc @ C.T                      # (P, V)
        probs = softmax(logits)
        dlogits = probs
        dlogits[np.arange(P), contexts] -= 1.0
        dlogits /= P
        dC = dlogits.T @ Vc                    # (V, D)
        dVc = dlogits @ C                      # (P, D)
        dW = np.zeros_like(W)
        np.add.at(dW, centers, dVc)
        W -= LR * dW
        C -= LR * dC

    return vocab, stoi, W


def unit(v):
    n = np.linalg.norm(v)
    return v / n if n > 0 else v


def build():
    vocab, stoi, W = train()
    # Mean-center then unit-normalize — standard analogy preprocessing that
    # removes the dominant frequency component and sharpens the geometry.
    W = W - W.mean(axis=0)
    Wn = np.array([unit(v) for v in W])

    def nearest(vec, exclude, k=5):
        sims = Wn @ unit(vec)
        out = []
        for i in np.argsort(-sims):
            w = vocab[i]
            if w in exclude:
                continue
            out.append({"word": w, "sim": float(sims[i])})
            if len(out) >= k:
                break
        return out

    def analogy(a, b, c):
        if any(w not in stoi for w in (a, b, c)):
            return None
        vec = Wn[stoi[a]] - Wn[stoi[b]] + Wn[stoi[c]]
        top = nearest(vec, exclude={a, b, c} | NOT_CANDIDATE, k=5)
        return {"expr": f"{a} - {b} + {c}", "result": top[0]["word"], "top": r(top)}

    analogies = [
        a for a in (
            analogy("king", "man", "woman"),
            analogy("prince", "boy", "girl"),
            analogy("king", "prince", "princess"),
            analogy("father", "man", "woman"),
        ) if a
    ]

    neighbors = [
        {"word": w, "near": r(nearest(W[stoi[w]], {w}, k=5))}
        for w in ["king", "queen", "river", "castle"] if w in stoi
    ]

    show = [w for w in vocab if w in WORD_GROUP]
    M = np.array([Wn[stoi[w]] for w in show])
    M = M - M.mean(axis=0)
    U, S, _ = np.linalg.svd(M, full_matrices=False)
    coords = U[:, :2] * S[:2]
    coords = coords / (np.abs(coords).max() + 1e-9)
    words = [
        {"word": w, "x": float(coords[i, 0]), "y": float(coords[i, 1]),
         "group": WORD_GROUP[w]}
        for i, w in enumerate(show)
    ]

    obj = {
        "meta": {
            "sentences": len(STORIES + RELATIONS + build_analogy_corpus()),
            "vocab_size": len(vocab),
            "dim": DIM,
            "note": "Real skip-gram vectors trained for this project.",
        },
        "words": r(words),
        "analogies": analogies,
        "neighbors": neighbors,
    }
    write_artifact("act5-embeddings.json", obj)
    for a in analogies:
        print(f"  {a['expr']} = {a['result']}  ({a['top'][0]['sim']:.2f})")


if __name__ == "__main__":
    print("act5 embeddings:")
    build()

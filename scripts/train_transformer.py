"""Acts 6 & 7 — trains the tiny transformer and exports its real attention
matrices (act 6) and next-token distributions + autoregressive generation
(act 7). Uses transformer.py (gradient-checked forward/backward)."""

import numpy as np

from corpus import STORIES
from transformer import (
    Config, init_params, forward, cross_entropy, backward, softmax,
)
from _util import write_artifact, r

SEED = 0
T = 16
STEPS = 1500
BATCH = 32
LR = 3e-3


def build_data():
    # word-level vocab with a beginning-of-story marker
    words = []
    for s in STORIES:
        words += ["<s>"] + s.lower().split()
    vocab = ["<s>"] + sorted(set(w for w in words if w != "<s>"))
    stoi = {w: i for i, w in enumerate(vocab)}
    stream = np.array([stoi[w] for w in words], dtype=np.int64)
    return vocab, stoi, stream


def get_batch(stream, cfg, rng):
    ix = rng.integers(0, len(stream) - cfg.T - 1, size=BATCH)
    x = np.stack([stream[i : i + cfg.T] for i in ix])
    y = np.stack([stream[i + 1 : i + 1 + cfg.T] for i in ix])
    return x, y


def adam_step(p, grads, state, lr, t):
    b1, b2, eps = 0.9, 0.999, 1e-8
    for k in p:
        m, v = state["m"][k], state["v"][k]
        g = grads[k]
        m[:] = b1 * m + (1 - b1) * g
        v[:] = b2 * v + (1 - b2) * (g * g)
        mh = m / (1 - b1**t)
        vh = v / (1 - b2**t)
        p[k] -= lr * mh / (np.sqrt(vh) + eps)


def train():
    vocab, stoi, stream = build_data()
    cfg = Config(vocab=len(vocab), T=T, D=32, H=2, L=2, F=64, seed=SEED)
    p = init_params(cfg)
    state = {"m": {k: np.zeros_like(v) for k, v in p.items()},
             "v": {k: np.zeros_like(v) for k, v in p.items()}}
    rng = np.random.default_rng(SEED)
    n_params = sum(v.size for v in p.values())
    print(f"  {n_params} parameters, vocab {len(vocab)}")
    for step in range(1, STEPS + 1):
        x, y = get_batch(stream, cfg, rng)
        logits, cache, _ = forward(p, x, cfg)
        loss, dl = cross_entropy(logits, y)
        grads = backward(p, cache, dl, cfg)
        adam_step(p, grads, state, LR, step)
        if step % 500 == 0 or step == 1:
            print(f"  step {step:4d}  loss {loss:.3f}")
    return vocab, stoi, p, cfg, n_params


def encode(stoi, words):
    return np.array([[stoi[w] for w in words]], dtype=np.int64)


def next_dist(p, cfg, ids):
    logits, _, _ = forward(p, ids[:, -cfg.T:], cfg)
    return logits[0, -1]  # (V,)


def top_tokens(vocab, probs, k=8):
    order = np.argsort(-probs)[:k]
    return [{"tok": vocab[i], "p": float(probs[i])} for i in order]


def sample(probs, temp, top_p, rng):
    logits = np.log(probs + 1e-12) / max(temp, 1e-6)
    pr = softmax(logits)
    order = np.argsort(-pr)
    cum = np.cumsum(pr[order])
    keep = order[: max(1, int(np.searchsorted(cum, top_p) + 1))]
    q = pr[keep] / pr[keep].sum()
    return int(rng.choice(keep, p=q))


def export_sampling(vocab, stoi, p, cfg, n_params):
    rng = np.random.default_rng(1)
    # "the" is a genuine branch point across the 32 stories, so its distribution
    # is naturally spread — ideal for showing what temperature does.
    prompt = ["<s>", "the"]
    base = softmax(next_dist(p, cfg, encode(stoi, prompt)))

    settings = []
    for temp in [0.3, 0.7, 1.3]:
        pr = softmax(np.log(base + 1e-12) / temp)
        settings.append({"temp": temp, "dist": r(top_tokens(vocab, pr))})

    # autoregressive generation from "the", middling temperature
    words = list(prompt)
    steps = []
    for _ in range(14):
        probs = softmax(next_dist(p, cfg, np.array([[stoi[w] for w in words]])))
        chosen = sample(probs, temp=0.7, top_p=0.9, rng=rng)
        steps.append({"chosen": vocab[chosen], "top": r(top_tokens(vocab, probs, 5))})
        words.append(vocab[chosen])
        if vocab[chosen] == "<s>":
            break

    obj = {
        "meta": {
            "params": n_params,
            "vocab_size": len(vocab),
            "context": cfg.T,
            "note": "Real next-token probabilities from this project's tiny transformer.",
        },
        "prompt": [w for w in prompt if w != "<s>"],
        "settings": settings,
        "generation": [s for s in steps if s["chosen"] != "<s>"],
    }
    write_artifact("act7-distributions.json", obj)
    print("  act7 prompt: 'the' ->",
          ", ".join(f"{d['tok']} {d['p']:.2f}" for d in settings[1]["dist"][:4]))


def export_attention(vocab, stoi, p, cfg):
    sentences = [
        ["<s>", "the", "king", "rode", "his", "horse", "to", "the", "river"],
        ["<s>", "the", "queen", "ruled", "the", "land", "with", "a", "gentle", "heart"],
    ]
    examples = []
    for sent in sentences:
        toks = [w for w in sent if w in stoi]
        ids = encode(stoi, toks)
        _, _, attns = forward(p, ids, cfg, want_attn=True)
        layers = [{"heads": r(a[0].tolist())} for a in attns]  # a: (1,H,T,T)
        examples.append({
            "tokens": ["⟨start⟩" if w == "<s>" else w for w in toks],
            "layers": layers,
        })
    obj = {
        "meta": {
            "layers": cfg.L,
            "heads": cfg.H,
            "note": "Real attention weights from this project's trained transformer.",
        },
        "examples": examples,
    }
    write_artifact("act6-attention.json", obj)
    print(f"  act6 attention: {len(examples)} sentences, {cfg.L} layers x {cfg.H} heads")


def build():
    vocab, stoi, p, cfg, n_params = train()
    export_sampling(vocab, stoi, p, cfg, n_params)
    export_attention(vocab, stoi, p, cfg)


if __name__ == "__main__":
    print("acts 6-7 transformer:")
    build()

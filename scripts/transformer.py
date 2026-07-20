"""A decoder-only transformer, from scratch, in numpy — forward and manual
backward for every operation. No ML libraries. Used to train the tiny model
behind acts 6 (attention) and 7 (sampling).

Kept deliberately small (a few thousand parameters) so it trains on a laptop CPU
in a minute or two. It is not smart. It is real.
"""

import numpy as np


# ----- config -------------------------------------------------------------
class Config:
    def __init__(self, vocab, T=16, D=32, H=2, L=2, F=64, seed=0):
        self.V = vocab
        self.T = T          # context length
        self.D = D          # model width
        self.H = H          # heads
        self.Dh = D // H
        self.L = L          # layers
        self.F = F          # mlp hidden
        self.seed = seed


# ----- parameter init -----------------------------------------------------
def init_params(cfg):
    rng = np.random.default_rng(cfg.seed)
    s = 0.02
    p = {
        "wte": rng.normal(0, s, (cfg.V, cfg.D)),
        "wpe": rng.normal(0, s, (cfg.T, cfg.D)),
        "lnf_g": np.ones(cfg.D),
        "lnf_b": np.zeros(cfg.D),
    }
    for l in range(cfg.L):
        p[f"ln1_g{l}"] = np.ones(cfg.D)
        p[f"ln1_b{l}"] = np.zeros(cfg.D)
        p[f"Wq{l}"] = rng.normal(0, s, (cfg.D, cfg.D))
        p[f"Wk{l}"] = rng.normal(0, s, (cfg.D, cfg.D))
        p[f"Wv{l}"] = rng.normal(0, s, (cfg.D, cfg.D))
        p[f"Wo{l}"] = rng.normal(0, s, (cfg.D, cfg.D))
        p[f"ln2_g{l}"] = np.ones(cfg.D)
        p[f"ln2_b{l}"] = np.zeros(cfg.D)
        p[f"W1{l}"] = rng.normal(0, s, (cfg.D, cfg.F))
        p[f"b1{l}"] = np.zeros(cfg.F)
        p[f"W2{l}"] = rng.normal(0, s, (cfg.F, cfg.D))
        p[f"b2{l}"] = np.zeros(cfg.D)
    return p


# ----- primitives ---------------------------------------------------------
def layernorm_fwd(x, g, b, eps=1e-5):
    mu = x.mean(-1, keepdims=True)
    xc = x - mu
    var = (xc**2).mean(-1, keepdims=True)
    inv = 1.0 / np.sqrt(var + eps)
    xn = xc * inv
    return xn * g + b, (xn, inv, g)


def layernorm_bwd(dout, cache):
    xn, inv, g = cache
    D = xn.shape[-1]
    dg = (dout * xn).reshape(-1, D).sum(0)
    db = dout.reshape(-1, D).sum(0)
    dxn = dout * g
    dx = inv / D * (D * dxn - dxn.sum(-1, keepdims=True) - xn * (dxn * xn).sum(-1, keepdims=True))
    return dx, dg, db


def gelu_fwd(x):
    c = np.sqrt(2.0 / np.pi)
    t = np.tanh(c * (x + 0.044715 * x**3))
    return 0.5 * x * (1 + t), (x, t, c)


def gelu_bwd(dout, cache):
    x, t, c = cache
    dt = c * (1 + 3 * 0.044715 * x**2)
    dx = 0.5 * (1 + t) + 0.5 * x * (1 - t**2) * dt
    return dout * dx


def softmax(z, axis=-1):
    z = z - z.max(axis=axis, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=axis, keepdims=True)


# ----- attention (multi-head, causal) -------------------------------------
def attn_fwd(x, p, l, cfg, mask):
    B, T, D = x.shape
    H, Dh = cfg.H, cfg.Dh
    q = x @ p[f"Wq{l}"]
    k = x @ p[f"Wk{l}"]
    v = x @ p[f"Wv{l}"]
    # (B,T,D) -> (B,H,T,Dh)
    def split(z):
        return z.reshape(B, T, H, Dh).transpose(0, 2, 1, 3)
    qs, ks, vs = split(q), split(k), split(v)
    scores = qs @ ks.transpose(0, 1, 3, 2) / np.sqrt(Dh)   # (B,H,T,T)
    scores = np.where(mask, scores, -1e9)
    attn = softmax(scores, axis=-1)
    ctx = attn @ vs                                        # (B,H,T,Dh)
    ctx_m = ctx.transpose(0, 2, 1, 3).reshape(B, T, D)
    out = ctx_m @ p[f"Wo{l}"]
    cache = (x, qs, ks, vs, attn, ctx_m, mask, l)
    return out, attn, cache


def attn_bwd(dout, cache, p, cfg, grads):
    x, qs, ks, vs, attn, ctx_m, mask, l = cache
    B, T, D = x.shape
    H, Dh = cfg.H, cfg.Dh
    grads[f"Wo{l}"] += ctx_m.reshape(-1, D).T @ dout.reshape(-1, D)
    dctx_m = dout @ p[f"Wo{l}"].T
    dctx = dctx_m.reshape(B, T, H, Dh).transpose(0, 2, 1, 3)  # (B,H,T,Dh)
    dattn = dctx @ vs.transpose(0, 1, 3, 2)                    # (B,H,T,T)
    dvs = attn.transpose(0, 1, 3, 2) @ dctx                    # (B,H,T,Dh)
    # softmax backward
    dscores = attn * (dattn - (dattn * attn).sum(-1, keepdims=True))
    dscores = np.where(mask, dscores, 0.0) / np.sqrt(Dh)
    dqs = dscores @ ks
    dks = dscores.transpose(0, 1, 3, 2) @ qs
    def merge(z):
        return z.transpose(0, 2, 1, 3).reshape(B, T, D)
    dq, dk, dv = merge(dqs), merge(dks), merge(dvs)
    grads[f"Wq{l}"] += x.reshape(-1, D).T @ dq.reshape(-1, D)
    grads[f"Wk{l}"] += x.reshape(-1, D).T @ dk.reshape(-1, D)
    grads[f"Wv{l}"] += x.reshape(-1, D).T @ dv.reshape(-1, D)
    dx = dq @ p[f"Wq{l}"].T + dk @ p[f"Wk{l}"].T + dv @ p[f"Wv{l}"].T
    return dx


# ----- full model ---------------------------------------------------------
def forward(p, idx, cfg, want_attn=False):
    B, T = idx.shape
    mask = np.tril(np.ones((T, T), dtype=bool))[None, None]
    x = p["wte"][idx] + p["wpe"][:T]
    caches = []
    attns = []
    for l in range(cfg.L):
        h, ln1c = layernorm_fwd(x, p[f"ln1_g{l}"], p[f"ln1_b{l}"])
        a, attn, ac = attn_fwd(h, p, l, cfg, mask)
        x = x + a
        h2, ln2c = layernorm_fwd(x, p[f"ln2_g{l}"], p[f"ln2_b{l}"])
        u = h2 @ p[f"W1{l}"] + p[f"b1{l}"]
        g, gc = gelu_fwd(u)
        m = g @ p[f"W2{l}"] + p[f"b2{l}"]
        x = x + m
        caches.append((ln1c, ac, ln2c, gc, h2, g, l))
        if want_attn:
            attns.append(attn)
    xf, lnfc = layernorm_fwd(x, p["lnf_g"], p["lnf_b"])
    logits = xf @ p["wte"].T          # weight tying
    cache = (idx, caches, lnfc, xf)
    return logits, cache, attns


def cross_entropy(logits, targets):
    B, T, V = logits.shape
    pr = softmax(logits, -1)
    idx = targets.reshape(-1)
    flat = pr.reshape(-1, V)
    loss = -np.log(flat[np.arange(len(idx)), idx] + 1e-9).mean()
    d = flat.copy()
    d[np.arange(len(idx)), idx] -= 1
    d /= len(idx)
    return loss, d.reshape(B, T, V)


def backward(p, cache, dlogits, cfg):
    idx, caches, lnfc, xf = cache
    B, T = idx.shape
    D = cfg.D
    grads = {k: np.zeros_like(v) for k, v in p.items()}
    # logits = xf @ wte.T
    grads["wte"] += dlogits.reshape(-1, cfg.V).T @ xf.reshape(-1, D)
    dxf = dlogits @ p["wte"]
    dx, dg, db = layernorm_bwd(dxf, lnfc)
    grads["lnf_g"] += dg
    grads["lnf_b"] += db
    for l in reversed(range(cfg.L)):
        ln1c, ac, ln2c, gc, h2, g, ll = caches[l]
        # mlp residual: x = x + m
        dm = dx
        grads[f"W2{ll}"] += g.reshape(-1, cfg.F).T @ dm.reshape(-1, D)
        grads[f"b2{ll}"] += dm.reshape(-1, D).sum(0)
        dg_ = dm @ p[f"W2{ll}"].T
        du = gelu_bwd(dg_, gc)
        grads[f"W1{ll}"] += h2.reshape(-1, D).T @ du.reshape(-1, cfg.F)
        grads[f"b1{ll}"] += du.reshape(-1, cfg.F).sum(0)
        dh2 = du @ p[f"W1{ll}"].T
        dxn2, dg2, db2 = layernorm_bwd(dh2, ln2c)
        grads[f"ln2_g{ll}"] += dg2
        grads[f"ln2_b{ll}"] += db2
        dx = dx + dxn2
        # attention residual: x = x + a
        da = dx
        dh1 = attn_bwd(da, ac, p, cfg, grads)
        dxn1, dg1, db1 = layernorm_bwd(dh1, ln1c)
        grads[f"ln1_g{ll}"] += dg1
        grads[f"ln1_b{ll}"] += db1
        dx = dx + dxn1
    # embeddings
    grads["wpe"][:T] += dx.reshape(B, T, D).sum(0)
    np.add.at(grads["wte"], idx.reshape(-1), dx.reshape(-1, D))
    return grads

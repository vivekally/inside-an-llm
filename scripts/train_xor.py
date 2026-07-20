"""Act 3 — A model is a file.

Trains two neural nets on XOR: a single-layer net (which provably cannot solve
it) and a multi-layer net (which can, via backpropagation). Records the real
loss curves and the final weights so the site can show that a trained "model"
is, quite literally, just a small list of numbers.
"""

import numpy as np

from _util import write_artifact, r

rng = np.random.default_rng(7)

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
Y = np.array([[0], [1], [1], [0]], dtype=float)


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))


def train_single(epochs=5000, lr=0.5):
    w = rng.normal(0, 1, (2, 1))
    b = np.zeros((1,))
    curve = []
    for e in range(epochs):
        z = X @ w + b
        out = sigmoid(z)
        err = out - Y
        loss = float(np.mean(err**2))
        d = err * out * (1 - out)
        w -= lr * (X.T @ d) / len(X)
        b -= lr * np.mean(d, axis=0)
        if e % 50 == 0 or e == epochs - 1:
            curve.append({"epoch": e, "loss": loss})
    out = sigmoid(X @ w + b).ravel().tolist()
    return {
        "loss_curve": r(curve),
        "final_outputs": r(out),
        "weights": {"w": r(w.ravel().tolist()), "b": r(b.tolist())},
        "params": w.size + b.size,
        "solved": bool(all((o > 0.5) == (t > 0.5) for o, t in zip(out, Y.ravel()))),
    }


def train_multi(hidden=4, epochs=5000, lr=0.5):
    w1 = rng.normal(0, 1, (2, hidden))
    b1 = np.zeros((hidden,))
    w2 = rng.normal(0, 1, (hidden, 1))
    b2 = np.zeros((1,))
    curve = []
    for e in range(epochs):
        h = sigmoid(X @ w1 + b1)
        out = sigmoid(h @ w2 + b2)
        err = out - Y
        loss = float(np.mean(err**2))
        d2 = err * out * (1 - out)
        dw2 = h.T @ d2 / len(X)
        db2 = np.mean(d2, axis=0)
        d1 = (d2 @ w2.T) * h * (1 - h)
        dw1 = X.T @ d1 / len(X)
        db1 = np.mean(d1, axis=0)
        w2 -= lr * dw2
        b2 -= lr * db2
        w1 -= lr * dw1
        b1 -= lr * db1
        if e % 50 == 0 or e == epochs - 1:
            curve.append({"epoch": e, "loss": loss})
    out = sigmoid(sigmoid(X @ w1 + b1) @ w2 + b2).ravel().tolist()
    return {
        "loss_curve": r(curve),
        "final_outputs": r(out),
        "weights": {
            "w1": r(w1.tolist()),
            "b1": r(b1.tolist()),
            "w2": r(w2.ravel().tolist()),
            "b2": r(b2.tolist()),
        },
        "params": w1.size + b1.size + w2.size + b2.size,
        "solved": bool(all((o > 0.5) == (t > 0.5) for o, t in zip(out, Y.ravel()))),
    }


def build():
    single = train_single()
    multi = train_multi()
    obj = {
        "inputs": X.astype(int).tolist(),
        "targets": Y.ravel().astype(int).tolist(),
        "single": single,
        "multi": multi,
    }
    write_artifact("act3-xor-training.json", obj)
    print(f"  single solved={single['solved']} ({single['params']} params)")
    print(f"  multi  solved={multi['solved']} ({multi['params']} params)")


if __name__ == "__main__":
    print("act3 xor:")
    build()

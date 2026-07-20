"""Regenerate every data artifact from scratch.

    python3 scripts/run_all.py

Deterministic (seeded), so re-running reproduces byte-identical artifacts.
Every number the site displays comes out of these runs — nothing is authored
by hand.
"""

import shannon
import train_xor
import train_bpe
import train_embeddings

STEPS = [
    ("act2 shannon", shannon.build),
    ("act3 xor", train_xor.build),
    ("act4 bpe", train_bpe.build),
    ("act5 embeddings", train_embeddings.build),
]


def main():
    for name, fn in STEPS:
        print(f"{name}:")
        fn()
    print("done.")


if __name__ == "__main__":
    main()

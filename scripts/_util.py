import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")


def write_artifact(name, obj):
    os.makedirs(DATA_DIR, exist_ok=True)
    path = os.path.join(DATA_DIR, name)
    with open(path, "w") as f:
        json.dump(obj, f, separators=(",", ":"))
    size = os.path.getsize(path)
    print(f"  wrote {name}  ({size/1024:.1f} KB)")
    return path


def r(x, n=4):
    """Round floats for compact, stable JSON."""
    if isinstance(x, float):
        return round(x, n)
    if isinstance(x, list):
        return [r(v, n) for v in x]
    if isinstance(x, dict):
        return {k: r(v, n) for k, v in x.items()}
    return x

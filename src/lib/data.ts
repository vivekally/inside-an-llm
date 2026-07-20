import { useEffect, useState } from "react";

/** Lazy-load a JSON artifact from public/data, resolving the Pages base path. */
export function useArtifact<T>(name: string, enabled = true): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (!enabled || data) return;
    let alive = true;
    fetch(`${import.meta.env.BASE_URL}data/${name}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${name}: ${r.status}`);
        return r.json();
      })
      .then((json) => alive && setData(json))
      .catch((err) => console.error("artifact load failed", err));
    return () => {
      alive = false;
    };
  }, [name, enabled, data]);

  return data;
}

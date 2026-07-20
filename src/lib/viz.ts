/** Data-viz helpers keyed to the DESIGN.md palette. */

export const CAT = ["#E4502A", "#2F5FD0", "#1F9E8A", "#C9A227", "#8B4A9C", "#5B6770"];

const RAMP = [
  [244, 238, 227], // paper
  [240, 201, 168],
  [232, 138, 90],
  [228, 80, 42], // signal
  [181, 52, 26], // signal-deep
];

/** Map t in [0,1] to the warm attention/probability ramp. */
export function ramp(t: number): string {
  const x = Math.max(0, Math.min(1, t)) * (RAMP.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = RAMP[i];
  const b = RAMP[Math.min(i + 1, RAMP.length - 1)];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** Readable text color for a given ramp intensity. */
export function rampText(t: number): string {
  return t > 0.55 ? "#F4EEE3" : "#1C1814";
}

export const pct = (p: number) => `${(p * 100).toFixed(0)}%`;
export const pct1 = (p: number) => `${(p * 100).toFixed(1)}%`;

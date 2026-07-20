# Inside an LLM — Design System

Original visual identity. Takes *inspiration* from the FT's 2023 explainer
(warm paper, serif-display + sans-body editorial contrast, full-bleed
scrollytelling, restraint, one idea per screen) but reuses none of its fonts,
colors, or assets. Do not deviate from this file without approval.

## The idea

A magazine longread about how a machine reads human language. The core visual
tension mirrors the subject: **warm human editorial serif** vs **precise machine
mono**. Human voice sets the story; the machine's voice (tokens, weights,
logits, code) is always in monospace. Warm paper for the narrative; ink-dark
"inside the machine" panels for the moments we go under the hood.

## Typography

Self-hosted via `@fontsource` (no external requests; keeps us CSP-clean and fast).

| Role | Family | Weights | Use |
|------|--------|---------|-----|
| Display | **Newsreader** | 400, 500, 600 + 400 italic | Big scrollytelling statements, act titles, pull-quotes. Italic for emphasis. |
| Body / UI | **IBM Plex Sans** | 400, 500, 600 | Reading passages, captions, buttons, labels. |
| Machine | **IBM Plex Mono** | 400, 500 | Every token, number, weight, logit, probability, and code snippet. The "machine voice." |

Rules:
- Reading measure caps at **62ch**, centered.
- Display statements break full-width, `line-height: 1.05`, tight tracking.
- Any number the model produces (probabilities, weights, losses, token IDs) is
  **always** IBM Plex Mono with `tabular-nums`.
- Never set long body copy in mono.

Scale (fluid, `clamp`):
- Hero display: `clamp(2.75rem, 7vw, 6rem)`
- Act title: `clamp(2rem, 4.5vw, 3.5rem)`
- Section head: `clamp(1.4rem, 2.5vw, 2rem)`
- Body: `clamp(1.05rem, 1.25vw, 1.25rem)`, `line-height: 1.6`
- Caption / mono label: `0.8125rem`, letter-spacing `0.02em`, uppercase for labels

## Color

Warm parchment base (distinct from FT's salmon `#FFF1E5` — ours is cooler/lighter
and greener-neutral). One hero accent, used sparingly, plus a disciplined
data-viz palette.

### Core (CSS variables)
```
--paper:        #F4EEE3   /* warm parchment — default background            */
--paper-sunk:   #EDE6D8   /* slightly recessed panels, cards                */
--ink:          #1C1814   /* warm near-black — body text                    */
--ink-muted:    #6B6157   /* captions, secondary text                       */
--hairline:     #D8CDBB   /* borders, rules, axis lines                     */
--machine-bg:   #16130F   /* "inside the machine" dark panels               */
--machine-fg:   #F0E9DB   /* text on dark panels                            */
--machine-line: #322B22   /* borders/grids on dark panels                   */
```

### Accent
```
--signal:       #E4502A   /* vermillion — THE accent. interactive affordance,
                             the "chosen" token, key highlight. Use sparingly. */
--signal-deep:  #B5341A   /* pressed / deep end of the attention ramp        */
```
Signal vermillion is the one loud color. It marks: the interactive control the
reader should touch, the token the model actually picked, and the hottest cell
in a heatmap. If everything is vermillion, nothing is — keep it rare.

### Data-viz categorical (harmonized for warm paper)
Ordered; assign by index. Muted-saturated editorial tones.
```
--cat-1: #E4502A  vermillion   (also = signal)
--cat-2: #2F5FD0  ink blue     (query / "key" vectors, series B)
--cat-3: #1F9E8A  teal
--cat-4: #C9A227  ochre
--cat-5: #8B4A9C  plum
--cat-6: #5B6770  slate
```

### Sequential ramp — attention / probability intensity (single warm hue)
```
paper → #F0C9A8 → #E88A5A → #E4502A → #B5341A
```
Low = paper, high = signal-deep. Used for attention heatmaps and probability
saturation so "hotter = more attention/probability" reads instantly.

Contrast: ink `#1C1814` on paper `#F4EEE3` ≈ 12.6:1. Machine-fg on machine-bg ≈
13:1. All body text passes WCAG AAA.

## Layout & rhythm

- Full-bleed sections, **one idea per viewport**. Generous air (FT-style).
- Narrative passages: single centered column, 62ch, big vertical padding
  (`clamp(6rem, 14vh, 12rem)` between beats).
- **Widget acts** use a sticky "stage": on desktop the graphic pins while short
  text steps scroll past; on mobile the graphic sits above stacked text.
- Full-width display statements between acts act as chapter breaks (often on a
  `--machine-bg` panel to signal "we're going deeper").
- Thin left/top **progress rail** shows act 1–9 position.

## Motion

- Scroll-triggered reveals via IntersectionObserver; `ease-out`, 400–600ms.
- Widgets autoplay once on entering view; a mono **↻ replay** button re-runs;
  stepwise widgets (BPE merges, XOR loss, sampling) get a scrubber.
- **`prefers-reduced-motion`: no autoplay, no transitions — render the final
  frame immediately.** Every widget must have a meaningful static end state.
- No parallax gimmicks. Motion serves comprehension only.

## Voice in the UI

First person, builder-to-reader. "I trained this on 30 stories — scrub through
what it learned." Reader is "you." Captions under widgets state plainly what's
real: "Real output. This 52k-parameter model ran in your browser's data file."

## Anti-slop guardrails

- No blue→purple AI gradients. No glowing neon. No generic "neural network of
  glowing dots" hero.
- No pure white `#FFFFFF` and no pure black `#000000` anywhere.
- Accent is earned, not decorative.
- Every chart uses the palette above — no default library colors.

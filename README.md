# Likith Saribala · Portfolio

Personal portfolio with an interactive hero. The cursor picks one of three zones
across the hero and the character reacts:

- **Left** and **right**: he turns to that side ("Anyone here on the left?"),
  holds for about 2.5 seconds, then goes back to working on the laptop.
- **Center**: the greeting. He looks up from the laptop, says "Hey, it's you!"
  and "Hiiii!", then points you down to the portfolio.

The character never follows the cursor. On phones the side zones are off: the
greeting plays once when the hero comes into view, and tapping replays it.

## Run it

It's a static site with no build step.

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Any static host works (GitHub Pages, Netlify, Vercel).

## Files

| Path | What it is |
|------|------------|
| `index.html` | Page content: hero, work, about, contact |
| `css/styles.css` | Design tokens (rose / maroon palette, Bodoni Moda + Hanken Grotesk + IBM Plex Mono) and layout |
| `js/hero.js` | Zone detection, the reaction timeline, and a `requestAnimationFrame` loop that writes transforms directly (no framework, no re-renders) |
| `assets/likith.webp` | Background-removed portrait |
| `frames/` | Optional video frames. See [`frames/README.md`](frames/README.md) |
| `tools/extract-frames.sh` | Turns a video into frames with ffmpeg |

## Editing content

Projects, the about text and contact links are plain HTML in `index.html`.
Reaction messages and timings are at the top of `js/hero.js` (`MESSAGES`,
`LOOK_HOLD`, and each renderer's `durations`).

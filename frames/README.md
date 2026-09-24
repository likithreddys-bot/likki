# Character frames

The hero works without this folder: it animates the cut-out photo in
`assets/likith.webp`. To use a real character video instead, add frames here.

1. Make one short video with a locked camera. Keep the same person, clothes,
   laptop, lighting and framing the whole way through, and leave clean space
   above the head for the navigation. In this order:
   working on the laptop, looking left, looking right, noticing the visitor,
   taking off the headset and resting it on the neck, waving, pointing down.
2. Export frames:

   ```sh
   tools/extract-frames.sh ~/Videos/hero.mp4 24 1100
   ```

3. Copy `manifest.example.json` to `manifest.json`, set `count`, and set each
   segment to its first and last frame number:

   | Segment | What happens in those frames |
   |---------|------------------------------|
   | `work`  | Working on the laptop. Plays back and forth as the idle loop. |
   | `left`  | From the working pose to fully looking left. Plays forward on hover, holds, then plays backward. |
   | `right` | From the working pose to fully looking right. Same as `left`. |
   | `greet` | Noticing the visitor through waving and pointing down. |

When `frames/manifest.json` loads and every frame downloads, the hero switches to
the frames and hides the photo and the drawn laptop. If anything is missing, it
stays on the photo.

A transparent or white background works best, since the frames sit on the white
center glow.

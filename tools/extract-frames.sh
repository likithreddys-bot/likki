#!/usr/bin/env bash
# Turn the character video into web-ready frames for the hero.
#
#   tools/extract-frames.sh path/to/hero.mp4 [fps] [width]
#
# Writes frames/f_0001.webp, f_0002.webp, ... and prints the frame count to put
# in frames/manifest.json. Needs ffmpeg with libwebp.
set -euo pipefail

video="${1:?usage: tools/extract-frames.sh video.mp4 [fps] [width]}"
fps="${2:-24}"
width="${3:-1100}"
out="$(dirname "$0")/../frames"

mkdir -p "$out"
rm -f "$out"/f_*.webp

ffmpeg -loglevel error -i "$video" \
  -vf "fps=${fps},scale=${width}:-2:flags=lanczos" \
  -c:v libwebp -quality 78 -compression_level 6 \
  "$out/f_%04d.webp"

count=$(ls "$out"/f_*.webp | wc -l | tr -d ' ')
echo "Wrote $count frames at ${fps} fps to $out"
echo "Set \"count\": $count in frames/manifest.json and mark the segment ranges."

#!/bin/sh
# Vertical Shorts A/B/C from the main film (run build.sh first: it makes out/mix.wav).
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$LIB"
for K in A B C; do
  set -- $(sed -n "s/.*$K: { t0: \([0-9.]*\), t1: \([0-9.]*\).*/\1 \2/p" "$HERE/shorts.js")
  T0=$1; T1=$2; LEN=$(python3 -c "print(round($T1-$T0,2))")
  node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --q "short=$K" --out "$HERE/out/short_$K.mp4"
  # audio: the film's mix for that stretch, short fade, then silence under the end card; normalised to -14 LUFS
  ffmpeg -v error -y -ss "$T0" -t "$LEN" -i "$HERE/out/mix.wav" -af "afade=t=in:d=0.05,afade=t=out:st=$(python3 -c "print($LEN-0.3)"):d=0.3,apad=pad_dur=1.6,loudnorm=I=-14:TP=-1.5,aresample=48000" -c:a pcm_s24le "$HERE/out/short_$K.wav"
  ffmpeg -v error -y -i "$HERE/out/short_$K.mp4" -i "$HERE/out/short_$K.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$HERE/short_$K.mp4"
  echo "short_$K: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$HERE/short_$K.mp4") s"
done

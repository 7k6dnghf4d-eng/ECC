#!/bin/sh
# One command: subtitles → events → mix → picture → loudness → mux.
set -e
LIB=${LIB:-/root/lemo-opuscar}
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=estas-usando-la-ia-mal
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the lemo-opuscar library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
python3 -I "$HERE/tools/subs.py"
mkdir -p "$HERE/out"
"$PY" -c "import json,sys;json.dump(json.load(open(sys.argv[1]))['cues'],open(sys.argv[2],'w'),ensure_ascii=False)" "$HERE/subs.json" "$HERE/out/cues.json"
"$PY" "$LIB/core/render/srt.py" "$HERE/out/cues.json" "$HERE/subtitles_es.srt"
cd "$LIB"
node core/render/events.mjs "$HERE"
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"
# shortcut: mux.sh needs ffmpeg 7+ (6.x misreports length through loudnorm); with 6.x we normalise the audio alone in two passes and check its length ourselves.
M=$(ffmpeg -hide_banner -i "$HERE/out/mix.wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | sed -n "s/.*\"$1\" : \"\(.*\)\".*/\1/p"; }
ffmpeg -v error -y -i "$HERE/out/mix.wav" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s24le "$HERE/out/mix_norm.wav"
A=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$HERE/out/mix_norm.wav"); V=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$HERE/out/video.mp4")
python3 -c "import sys;a,v=map(float,sys.argv[1:]);assert abs(a-v)<0.1,f'audio {a}s vs video {v}s'" "$A" "$V"
ffmpeg -v error -y -i "$HERE/out/video.mp4" -i "$HERE/out/mix_norm.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest "$HERE/$NAME.mp4"
ffmpeg -v error -y -ss 28.5 -i "$HERE/$NAME.mp4" -frames:v 1 -q:v 2 "$HERE/poster.jpg"
ffmpeg -hide_banner -i "$HERE/$NAME.mp4" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated loudness" | tail -1
echo "done: $HERE/$NAME.mp4"

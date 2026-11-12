#!/bin/sh
# Encodes the ArchViz Configurator gallery from the c1–c6 cuts (run from the repo root).
# c_web = film of c1–c5 back to back; clips c2–c6. c1–c5 are cropped to the app viewport,
# c6 (window resize) keeps the desktop and only drops the taskbar.
set -e
IN=_sources/archconf/clips; OUT=images_v2
VIEW="crop=1372:744:262:146"; DESK="crop=1920:1040:0:0,scale=1372:-2"
out() { # name input-args filter poster-time
  n=$1; i=$2; vf=$3
  ffmpeg -v error -y $i -an -filter_complex "$vf,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset slow -crf 22 -maxrate 5M -bufsize 10M -movflags +faststart $OUT/$n.mp4
  ffmpeg -v error -y -i $OUT/$n.mp4 -an -c:v libvpx-vp9 -crf 37 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 $OUT/$n.webm
  ffmpeg -v error -y -i $OUT/$n.mp4 -an -vf "scale=1280:-2,format=yuv420p" -c:v libx264 -preset slow -crf 24 -maxrate 2.5M -bufsize 5M -movflags +faststart $OUT/$n-m.mp4
  ffmpeg -v error -y -ss ${4:-1} -i $OUT/$n.mp4 -frames:v 1 -q:v 3 $OUT/$n.jpg
  ffmpeg -v error -y -i $OUT/$n.jpg -vf scale=900:-2 -q:v 4 $OUT/mobile/$n.jpg
  echo "done $n"
}
out c_web "-i $IN/c1.mp4 -i $IN/c2.mp4 -i $IN/c3.mp4 -i $IN/c4.mp4 -i $IN/c5.mp4" \
  "[0:v]$VIEW,setsar=1[a];[1:v]$VIEW,setsar=1[b];[2:v]$VIEW,setsar=1[c];[3:v]$VIEW,setsar=1[d];[4:v]$VIEW,setsar=1[e];[a][b][c][d][e]concat=n=5:v=1:a=0" 2.2
out c2 "-i $IN/c2.mp4" "[0:v]$VIEW" 7
for k in 3 4 5; do out c$k "-i $IN/c$k.mp4" "[0:v]$VIEW" 1.5; done
out c6 "-i $IN/c6.mp4" "[0:v]$DESK" 5
# card cover: c0 (edited highlight), first 53 s before the window resize
out c0 "-t 53 -i $IN/c0.mp4" "[0:v]$VIEW" 10

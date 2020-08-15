#!/bin/sh
ffmpeg -y -i tv.mp4 -c:a copy -filter:v fps=fps=30 -video_track_timescale 30000 tv-tmp_1.mp4
# reencode video on 960/720 4/3
ffmpeg -y -i tv-tmp_1.mp4 -c:a copy -ac 2 -ab 128k -c:v libx264 -x264opts 'keyint=30:min-keyint=30:no-scenecut' -b:v 1500k -maxrate 1500k -bufsize 1000k -vf scale=960:720,setdar=4/3 tv-refactored.mp4
rm -v tv-tmp_1.mp4

# dashify every two seconds
mkdir -p tv
rm tv/*
~/Downloads/gpac/bin/gcc/MP4Box -dash 2000 -rap -frag-rap -profile live -segment-name 'segment_$Number%06d$' -out tv/live.m3u8:dual tv-refactored.mp4
exit 0

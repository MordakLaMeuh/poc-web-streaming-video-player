#!/bin/sh
ffmpeg -y -i melanchon.mp4 -c:a copy -filter:v fps=fps=30 -video_track_timescale 30000 melanchon-tmp_1.mp4
# reencode video on 960/720 4/3
ffmpeg -y -i melanchon-tmp_1.mp4 -c:a copy -ac 2 -ab 128k -c:v libx264 -x264opts 'keyint=60:min-keyint=60:no-scenecut' -b:v 1500k -maxrate 1500k -bufsize 1000k -vf scale=960:720,setdar=4/3 melanchon-refactored.mp4
rm -v melanchon-tmp_1.mp4

# dashify every two seconds
mkdir -p melanchon
rm melanchon/*
~/Downloads/gpac/bin/gcc/MP4Box -dash 2000 -rap -frag-rap -profile live -segment-name 'segment_$Number%06d$' -out melanchon/live.m3u8:dual melanchon-refactored.mp4
exit 0

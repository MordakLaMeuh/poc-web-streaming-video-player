#!/bin/sh
# set fps to 29.97 & tnb to 30k
ffmpeg -y -i kiwi.mp4 -c:a copy -filter:v fps=fps=30 -video_track_timescale 30000 kiwi-tmp_1.mp4
# reencode video on 960/720 4/3
ffmpeg -y -i kiwi-tmp_1.mp4 -c:a copy -ac 2 -ab 128k -c:v libx264 -x264opts 'keyint=30:min-keyint=30:no-scenecut' -b:v 1500k -maxrate 1500k -bufsize 1000k -vf scale=960:720,setdar=4/3 kiwi-tmp_2.mp4
# depplicate mono channel to stereo
ffmpeg -y -i kiwi-tmp_2.mp4 -c:v copy -ac 2 kiwi-refactored.mp4
rm -v kiwi-tmp_1.mp4 kiwi-tmp_2.mp4

# dashify every two seconds
mkdir -p kiwi
rm kiwi/*
~/Downloads/gpac/bin/gcc/MP4Box -dash 2000 -rap -frag-rap -profile live -segment-name 'segment_$Number%06d$' -out kiwi/live.m3u8:dual kiwi-refactored.mp4
exit 0

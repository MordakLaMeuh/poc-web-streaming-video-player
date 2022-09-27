#!/bin/sh
mkdir -p $1
~/Downloads/ffmpeg/ffmpeg -hide_banner -y -i ../$1-refactored.mp4 -c:v copy -f hls -hls_init_time 0 -hls_list_size 0 -hls_segment_type fmp4 -hls_segment_filename $1/segment_%06d.m4s $1/playlist.m3u8
exit $?

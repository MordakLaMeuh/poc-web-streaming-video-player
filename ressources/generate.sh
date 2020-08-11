#!/bin/sh
mkdir $1
ffmpeg -hide_banner -y -i $1.mp4 -c:v copy -c:a copy -f hls -hls_list_size 0 -hls_time 10 -hls_segment_type fmp4 -hls_segment_filename $1/original_%03d.m4s $1/original_playlist.m3u8
exit $?

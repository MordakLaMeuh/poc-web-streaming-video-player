#!/bin/sh
mkdir -p $1
rm -rvf $1/*
~/Downloads/ffmpeg/ffmpeg -i ../$1-refactored.mp4 -c copy \
-f dash -seg_duration 2 \
-hls_playlist 1 -streaming 1 -dash_segment_type mp4 \
-init_seg_name 'segment_$RepresentationID$_init.mp4' -media_seg_name 'segment_$RepresentationID$_$Number%06d$.dash' $1/out.mpd
exit $?

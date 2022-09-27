#!/bin/sh
name=sine
mkdir -p $name
rm -rvf $name/*
~/Downloads/ffmpeg/ffmpeg -loglevel verbose -y \
-f lavfi -i "sine=frequency=1000:duration=32:r=48000" \
-c:a aac -b:a 128k -ac 1 \
sine.mp4

~/Downloads/ffmpeg/ffmpeg -loglevel verbose -y \
-itsoffset 0.021333 \
-i sine.mp4 \
-f dash -seg_duration 8 \
-hls_playlist 1 -streaming 1 -dash_segment_type mp4 \
-init_seg_name 'segment_$RepresentationID$_init.mp4' -media_seg_name 'segment_$RepresentationID$_$Number%06d$.dash' $name/out.mpd
exit $?

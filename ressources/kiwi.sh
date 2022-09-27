#!/bin/sh
name=kiwi

rm -rvf $name
mkdir -p $name
mkdir -p $name/video
mkdir -p $name/audio

# Rework initial video -> 30fps 8s keyframes, 48000hz audio aac:1024 mono
~/Downloads/ffmpeg/ffmpeg -loglevel verbose -y \
-i $name.mp4 \
-vf scale=960:720,setdar=4/3,fps=30 \
-c:v libx264 -x264opts 'keyint=240:min-keyint=240:no-scenecut' -b:v 1500k -maxrate 1500k -bufsize 1000k \
-ar 48000 -c:a aac -b:a 128k -ac 1 \
-shortest \
$name-refactored.mp4

# Extract video hashes
~/Downloads/ffmpeg/ffmpeg -loglevel verbose -y \
-i $name-refactored.mp4 \
-an \
-c:v copy \
-f dash -seg_duration 8 \
-hls_playlist 1 -streaming 1 -dash_segment_type mp4 \
-init_seg_name 'video_init.mp4' -media_seg_name 'video_$Number%06d$.dash' $name/video/video.mpd

# Extract audio hashed with a delta of 21ms to correct ffmpeg mp4 dash strange audio behavior
~/Downloads/ffmpeg/ffmpeg -loglevel verbose -y \
-itsoffset 0.021333 \
-i $name-refactored.mp4 \
-vn \
-c:a copy \
-f dash -seg_duration 8 \
-hls_playlist 1 -streaming 1 -dash_segment_type mp4 \
-init_seg_name 'audio_init.mp4' -media_seg_name 'audio_$Number%06d$.dash' $name/audio/audio.mpd
# Maybe there is a tip to merge these commands
exit $?

# ./configure --enable-libx264 --enable-gpl --enable-libopus --enable-libmp3lame
# sudo apt install libmp3lame-dev libopus-dev libx264-dev
# -vf scale=960:720,setdar=4/3,fps=30 -video_track_timescale 30000 \

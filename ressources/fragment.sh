#!/bin/sh
ffmpeg -i $1.mp4 -c:a copy -c:v copy -movflags frag_keyframe+empty_moov+default_base_moof $1_fragmented.mp4
exit $?

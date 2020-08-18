#/bin/bash
ffmpeg -video_size 1920x1200 -framerate 25 -probesize 50M \
-f x11grab -thread_queue_size 10000000 -i :0.0+0,0 \
-f pulse -ac 2 -thread_queue_size 10000000 -i default -c:a aac -ac 1 -ab 128k \
-c:v libx264 -x264opts 'keyint=60:min-keyint=60:no-scenecut' \
-b:v 1500k -maxrate 1500k -bufsize 1000k -vf scale=-1:720 -threads 8 \
-seg_duration 2 -f dash test.mdp
exit $?

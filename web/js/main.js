import HLSVideoReader from './build/HLSVideoReader.js';

const baseUrl = 'http://localhost/';
const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2""';

function getTxtAsync(url) {
    // Promises require two functions: one for success, one for failure
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                // We can resolve the promise
                resolve(xhr.response);
            } else {
                // It's a failure, so let's reject the promise
                reject("Unable to load RSS at :" + url);
            }
        }
        xhr.onerror = () => {
            // It's a failure, so let's reject the promise
            reject("Unable to load RSS at :" + url);
        };
        xhr.send();
    });
}

function getBinaryAsync(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject("Unable to load RSS at :" + url);
            }
        };
        xhr.send();
    });
}

function start() {
    var reader = new HLSVideoReader();
    var promesses = new Array;
    promesses.push(getTxtAsync(baseUrl + 'ts/farador/playlist.m3u8'));
    promesses.push(getTxtAsync(baseUrl + 'ts/melanchon/playlist.m3u8'));
    Promise.all(promesses).then(values => {
        console.log(values.length)
        values.forEach(function(elem) {
            reader.addPlaylist(elem);
        });
        console.log("end of loading playlist");
    }, reason => {
        console.log(reason)
    });


    var mediaSource = new MediaSource();
    console.log(MediaSource.isTypeSupported(mimeCodec));
    var video = document.getElementsByTagName("video")[0];
    video.src = URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', sourceOpen);

    function sourceOpen (_) {
        var mediaSource = this;
        console.log(mediaSource.readyState);
        var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
        //sourceBuffer.appendWindowEnd = 4.0;

        getBinaryAsync('http://localhost/farador_dashinit.mp4').then(arrayBuffer => {
            console.log("data length: " + arrayBuffer.byteLength);

            // Attempts to call a given function 'fn' with smaller and smaller data slice. (1, 1/2, 1/4, 1/8...)
            {
            let data = new Uint8Array(arrayBuffer);
            let divisor = 1;
            let start_offset = 0;
            let chunk_size;

            let append_chunk = function() {
                let chunk = data.subarray(start_offset, ((start_offset + chunk_size) > data.length) ? data.length : start_offset + chunk_size);
                sourceBuffer.appendBuffer(chunk);
            }

            sourceBuffer.addEventListener('updateend', function (_) {
                start_offset += chunk_size;
                if (start_offset < data.length) {
                    append_chunk();
                } else {
                    // Consider here that the loading was succesfull
                    mediaSource.endOfStream();
                }
            });
            sourceBuffer.addEventListener('error', function (e) {
                console.error(e);
            });
            sourceBuffer.addEventListener('abort', function (a) {
                console.error(a);
            });

            (function appendFragments() {
                try {
                    chunk_size = Math.floor(data.length / divisor);
                    // WARN: We consider that when the first append is succesfull, the others will be same
                    append_chunk();
                } catch (e) {
                    divisor *= 2;
                    if (Math.floor(data.length / divisor) == 0) {
                        // In this critical case, even one byte per one byte causes an error
                        throw e;
                    } else {
                        appendFragments();
                    }
                }
            })();
            }
        }, reason => {
            console.log(reason)
        });
    }
}

start();

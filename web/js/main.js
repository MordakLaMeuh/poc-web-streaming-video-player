import HLSVideoReader from './HLSVideoReader.js';

const baseUrl = window.location.hostname + '/';
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

// Attempts to call sourceBuffer.appendBuffer() with smaller and smaller data slice. (1, 1/2, 1/4, 1/8...)
function loadVideo(sourceBuffer, arrayBuffer) {
    return new Promise(function (resolve, reject) {
        console.info("data length: " + arrayBuffer.byteLength);
        try {
            let data = new Uint8Array(arrayBuffer);
            let start_offset = 0;
            let chunk_size = data.length;

            let append_chunk = function() {
                let chunk = data.subarray(start_offset, ((start_offset + chunk_size) > data.length) ? data.length : start_offset + chunk_size);
                sourceBuffer.appendBuffer(chunk);
                console.info("appending " + chunk.length + " bytes");
            }

            let onupdate = function() {
                start_offset += chunk_size;
                if (start_offset < data.length) {
                    try {
                        append_chunk();
                    } catch (e) {
                        removeAllEventListeners();
                        reject("append_chunk: " + e);
                    }
                } else {
                    // Consider here that the loading was succesfull
                    removeAllEventListeners();
                    resolve();
                }
            }
            let onerror = function(e) {
                console.error(e);
                removeAllEventListeners();
                reject("error evt: " + e);
            }
            let onabort = function(a) {
                console.error(a);
                removeAllEventListeners();
                reject("abort evt: " + a);
            }
            let removeAllEventListeners = function() {
                sourceBuffer.removeEventListener('updateend', onupdate);
                sourceBuffer.removeEventListener('error', onerror);
                sourceBuffer.removeEventListener('abort', onabort);
            }

            sourceBuffer.addEventListener('updateend', onupdate);
            sourceBuffer.addEventListener('error', onerror);
            sourceBuffer.addEventListener('abort', onabort);

            // Recurse call until TRY pattern works
            (function appendFragments() {
                try {
                    // WARN: We consider that when the first append is succesfull, the others will be same
                    append_chunk();
                } catch (e) {
                    chunk_size = Math.floor(chunk_size / 2);
                    if (chunk_size == 0) {
                        // In this critical case, even one byte per one byte causes an error
                        throw("Too many reduction: " + e);
                    } else {
                        appendFragments();
                    }
                }
            })();
        }
        catch (e) {
            removeAllEventListeners();
            reject("Unexpected error: " + e);
        }
    });
}

// Some bullshit
let idName = 'msg';
var alternateStatusTXT = (function() {
    var elmt;
    var interval;
    var state = false;
    return function(idName) {
        if (elmt) {
            if (elmt.id == idName) {
                clearInterval(interval);
                elmt = null;
                return;
            }
        } else {
            elmt = document.getElementById(idName);
            interval = setInterval(function() {
                if (state) {
                    state = false;
                    elmt.style.opacity = 0;
                } else {
                    state = true;
                    elmt.style.opacity = 1;
                }
            }, 500);
        }
    };
})();

function start() {
    // Some bullshit
    alternateStatusTXT(idName);

    console.log(baseUrl);
    console.log(window.location.host);
    var reader = new HLSVideoReader();
    var promesses = new Array;
    promesses.push(getTxtAsync('http://' + baseUrl + 'no_utilized_formats/ts/farador/playlist.m3u8'));
    promesses.push(getTxtAsync('http://' + baseUrl + 'no_utilized_formats/ts/melanchon/playlist.m3u8'));
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

        // sourceBuffer.appendWindowEnd = 4.0;
        // mediaSource.duration = 3.5; // (51200 + 25600) / 12800
        // sourceBuffer.mode = 'segments';

        const ELMT_DURATION = 2;

        class Elmt {
            constructor(video, index) {
                this.video = video;
                this.index = index;
            }
            get name() {
                return this.video + '/segment_' + this._pad(this.index, 6) + '.m4s';
            }
            _pad(number, length) {
                var str = '' + number;
                while (str.length < length) {
                    str = '0' + str;
                }
                return str;
            }
        }

        let list = new Array();
        list.push(new Elmt('farador', 68));
        list.push(new Elmt('farador', 69));
        list.push(new Elmt('farador', 70));
        list.push(new Elmt('farador', 71));
        list.push(new Elmt('melanchon', 5));
        list.push(new Elmt('tv', 1));
        list.push(new Elmt('melanchon', 6));
        list.push(new Elmt('farador', 311));
        list.push(new Elmt('farador', 312));
        list.push(new Elmt('kiwi', 1));
        list.push(new Elmt('kiwi', 2));
        list.push(new Elmt('kiwi', 3));
        list.push(new Elmt('kiwi', 4));
        list.push(new Elmt('kiwi', 5));
        list.push(new Elmt('kiwi', 6));
        list.push(new Elmt('kiwi', 7));
        list.push(new Elmt('kiwi', 8));
        list.push(new Elmt('kiwi', 9));
        list.push(new Elmt('kiwi', 10));
        list.push(new Elmt('kiwi', 11));
        list.push(new Elmt('kiwi', 12));
        list.push(new Elmt('kiwi', 13));
        list.push(new Elmt('kiwi', 14));
        list.push(new Elmt('kiwi', 15));
        list.push(new Elmt('farador', 332));
        list.push(new Elmt('farador', 333));
        list.push(new Elmt('farador', 334));
        list.push(new Elmt('farador', 335));
        list.push(new Elmt('farador', 336));
        list.push(new Elmt('farador', 337));
        list.push(new Elmt('tv', 1));

        list.reverse();
        console.log(list);
        mediaSource.duration = list.length * ELMT_DURATION;

        let elmt_counter = 0;

        let make_promise = function() {
            let elmt = list.pop();
            sourceBuffer.timestampOffset = (elmt_counter - (elmt.index - 1)) * ELMT_DURATION;
            getBinaryAsync('http://' + baseUrl + elmt.name).then(arrayBuffer => {
                loadVideo(sourceBuffer, arrayBuffer).then(_ => {
                    if (list.length == 0) {
                        console.info("endOfStream");
                        // Some bullshit
                        alternateStatusTXT(idName);
                        document.getElementById(idName).style.display = 'none';
                        document.getElementsByTagName('video')[0].style.display = 'block';

                        mediaSource.endOfStream();
                    } else {
                        elmt_counter += 1;
                        make_promise();
                    }
                },
                reason => {
                    console.error(reason);
                });
            }, reason => {
                console.log(reason)
            })
        }

        getBinaryAsync('http://' + baseUrl + 'farador/segment_init.mp4').then(arrayBuffer => {
            loadVideo(sourceBuffer, arrayBuffer).then(_ => {
                make_promise();
            },
            reason => {
                console.error(reason);
            });
        }, reason => {
            console.log(reason)
        })
    }
}

start();

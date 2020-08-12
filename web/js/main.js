import HLSVideoReader from './build/HLSVideoReader.js';
const baseUrl = 'http://localhost/';

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

function start() {
    var reader = new HLSVideoReader();
    console.log(reader.init(document.getElementsByTagName("video")[0]));

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
}

start();

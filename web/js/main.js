import HLSVideoReader from './build/HLSVideoReader.js';
//import { Parser } from './m3u8-parser.es.js';

const baseUrl = 'http://localhost/';
function start() {
    var reader = new HLSVideoReader();
    console.log(reader.init(document.getElementsByTagName("video")[0]));
    reader.setUrl(baseUrl + 'ts/farador/');
}
start();

import { Parser } from './m3u8-parser.es.js';

export default class HLSVideoReader {
    constructor() {}
    init(video :HTMLVideoElement): string {
        console.log(video);
        video.src = "http://localhost/farador.mp4";
        var output: string = "HLSVideoReader started";
        return output;
    }
    addPlaylist(raw_text: string) {
        // Any is necessary for bullshit reasons
        var parser = new (Parser as any)();
        parser.push(raw_text);
        parser.end();
        let parsedManifest = parser.manifest;
        console.log(parsedManifest);
    }
}

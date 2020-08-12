import { Parser } from './m3u8-parser.es.js';

export default class HLSVideoReader {
    constructor() {}
    init(video :HTMLVideoElement): string {
        console.log(video);
        video.src = "http://localhost/farador.mp4";
        var output: string = "HLSVideoReader started";
        return output;
    }
    setUrl(url: string) {
        var manifest = [
            '#EXTM3U',
            '#EXT-X-VERSION:3',
            '#EXT-X-TARGETDURATION:6',
            '#EXT-X-MEDIA-SEQUENCE:0',
            '#EXT-X-DISCONTINUITY-SEQUENCE:0',
            '#EXTINF:6,',
            '0.ts',
            '#EXTINF:6,',
            '1.ts',
            '#EXTINF:6,',
            '2.ts',
            '#EXT-X-ENDLIST'
        ].join('\n');

        // Any is necessary for bullshit reasons
        var parser = new (Parser as any)();
        parser.push(manifest);
        parser.end();
        let parsedManifest = parser.manifest;
        console.log(parsedManifest);
        console.log(url);
    }
}

class HLSVideoReader {
    constructor() {}
    init(video :HTMLVideoElement): string {
        console.log(video);
        video.src = "http://localhost/farador.mp4";
        var output: string = "HLSVideoReader started";
        return output;
    }
}

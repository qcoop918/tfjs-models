import * as posenet from '@tensorflow-models/posenet';
import { getRowsCols } from '@tensorflow/tfjs-core/dist/backends/webgl/webgl_util';

const button = document.querySelector("#button");
const download = document.querySelector("#download");
const csv = [];
button.addEventListener('click', () => video.paused ? video.play() : video.pause());
download.addEventListener('click', () => {
    let file = "data:text/csv;charset=utf-8," + csv.map((c) => {
        let line = "";
        let i
        for(i=0; i<c.length; i++) {
            if(c[i].score > 0.15){
                line += `${c[i].position.x/1920},${c[i].position.y/1080}`
            }
            else{
                line += `${0},${0}`
            }
            if(i < c.length - 1){
                line += (",")
            }
        }
        return line
    }).join("\n");
    var encodedUri = encodeURI(file);
    download.setAttribute("href", encodedUri);
    download.setAttribute("download", "my_data.csv");
});
async function load() {
    const net = await posenet.load();
    startProcess(net);
}

const startProcess = (net) => {
    const video = document.getElementById('video');
    const canvas = document.getElementById("output");
    const ctx = canvas.getContext("2d");

    async function estimateMultiplePosesOnImage(imageElement) {

        // estimate poses
        const poses = await net.estimatePoses(imageElement, {
            flipHorizontal: true,
            decodingMethod: 'multi-person',
            maxDetections: 1,
            scoreThreshold: 0.15,
            nmsRadius: 30
        });

        return poses;
    }


    async function run() {
        let imageElement = document.getElementById('video');;
        const poses = estimateMultiplePosesOnImage(imageElement);
        const result = await poses.then(result => result);
        csv.push(result[0].keypoints);
        ctx.drawImage(video, 0, 0);
        console.log(result[0].keypoints);
        video.requestVideoFrameCallback(run);
    }
    video.requestVideoFrameCallback(run);
}
window.addEventListener('load', load);
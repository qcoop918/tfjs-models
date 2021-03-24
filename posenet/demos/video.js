import * as posenet from '@tensorflow-models/posenet';
import yolo from 'tfjs-yolo';
const button = document.querySelector("#labels");
const download = document.querySelector("#download");
const results = document.querySelector('#results');
const video = document.getElementById('video');
const processed = false;
const csv = [];
const boxArray = [];
let frames = 1;
results.addEventListener('click', () => {
    console.log(csv);
    console.log(boxArray);
    console.log(processed);
});
button.addEventListener('click', () => {
    let file = "data:text/csv;charset=utf-8," + csv.map((c, index) => {
        return "0"
    }).join("\n");
    var encodedUri = encodeURI(file);
    button.setAttribute("href", encodedUri);
    button.setAttribute("download", "labels.csv");
});
download.addEventListener('click', () => {
    let file = "data:text/csv;charset=utf-8," + csv.map((c, index) => {
        let line = "";
        let person = false;
        for (let b of boxArray[index]) {
            if (b.class == "person") {
                person = true;
            }
        }
        if (person) {
            for (let i = 0; i < c.length; i++) {
                if (c[i].score > 0.15) {
                    line += `${c[i].position.x / 1920},${c[i].position.y / 1080}`
                }
                else {
                    line += `${0},${0}`
                }
                if (i < c.length - 1) {
                    line += (",")
                }
            }
        }
        else {
            line = "-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1";
        }
        return line
    }).join("\n");
    var encodedUri = encodeURI(file);
    download.setAttribute("href", encodedUri);
    download.setAttribute("download", "my_data.csv");
});
async function load() {
    document.getElementById("frames").innerText = frames;
    const net = await posenet.load();
    const myYolo = await yolo.v3();
    startProcess(net, myYolo);
}

const startProcess = (net, myYolo) => {

    //hides button until models are loaded
    if (myYolo && net) {
        video.play();
        video.controls = true;
    }

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
    async function estimateYolo(imageElement) {
        const boxes = await myYolo.predict(imageElement, { scoreThreshold: .2 });
        return boxes;
    }

    async function run() {
        video.pause()
        document.getElementById("frames").innerText = frames;
        frames++;
        let imageElement = document.getElementById('video');;
        const boxes = estimateYolo(imageElement);
        const boxResult = await boxes.then(result => result);
        boxArray.push(boxResult);
        const poses = estimateMultiplePosesOnImage(imageElement);
        const result = await poses.then(result => result);
        if (result.length < 1) {
            result.push({keypoints: [{
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }, {
                score: 0,
                position: { x: 0, y: 0 },
            }]})
        }
        csv.push(result[0].keypoints);
        video.play()
        video.requestVideoFrameCallback(run);
    }
    video.requestVideoFrameCallback(run);
}
window.addEventListener('load', load);
let wasmWorker = new Worker('wasm-worker.js');
let elapsedTime;
let detectedZone;
let cameraStopped = false;
let image;
const canvas = document.getElementById('canvas');
const context = canvas.getContext("2d");
const camera = new Camera(context, processVideo);
camera.setDevicesList();

function calculateSize(srcSize, dstSize) {
    var srcRatio = srcSize.width / srcSize.height;
    var dstRatio = dstSize.width / dstSize.height;
    if (dstRatio > srcRatio) {
        return {
            width:  dstSize.height * srcRatio,
            height: dstSize.height
        };
    } else {
        return {
            width:  dstSize.width,
            height: dstSize.width / srcRatio
        };
    }
}

function processVideo(video){
    canvas.width = canvas.scrollWidth;
    canvas.height = canvas.scrollHeight;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        var videoSize = { width: video.videoWidth, height: video.videoHeight };
        var canvasSize = { width: canvas.width, height: canvas.height };
        var renderSize = calculateSize(videoSize, canvasSize);
        var xOffset = (canvasSize.width - renderSize.width) / 2;
        context.drawImage(video, xOffset, 0, renderSize.width, renderSize.height);
    }
    //context.drawImage(video, 0, 0);
    image = context.getImageData(0, 0, canvas.width, canvas.height);

    if(wasmWorker){
        wasmWorker.postMessage({'cmd': 'processFrame', 'image': image});
    }

    if (detectedZone){
        context.beginPath();
        context.rect(detectedZone.x, detectedZone.y, detectedZone.width, detectedZone.height);
        context.lineWidth = 2;
        context.strokeStyle = 'green';
        context.stroke();
    }

    if (elapsedTime) {
        context.fillStyle = "green";
        context.font = "24px verdana, sans-serif"
        context.fillText(elapsedTime, 10, 30);
    }

    if(cameraStopped){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function startCamera(){
    if(!wasmWorker){
        wasmWorker = new Worker('wasm-worker.js');
    }
    setListeners();
    camera.startCamera();
    if(cameraStopped){
        cameraStopped = false;
    }
}

function stopCamera(){
    if(camera){
        camera.stopCamera();
        cameraStopped = true;
    }
    if(wasmWorker){
        wasmWorker.terminate();
        wasmWorker = undefined;
    }
}

async function onRuntimeInitialized() {
    console.log("Document Extractor Initialized!")
}

function setDetectedZone(zone){
    detectedZone = zone
}

function setElapsedTime(time){
    elapsedTime = time;
}

function setListeners(){
    wasmWorker.addEventListener('message', async (e) => {
        switch(e.data.cmd) {
            case 'onRuntimeInitialized':
                await onRuntimeInitialized();
                break;
            case 'setDetectedZone':
                setDetectedZone(e.data.zone);
                break;
            case 'timeFinished':
                setElapsedTime(e.data.elapsedTime)
                break;
        }
    }, false);
}
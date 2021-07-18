let wasmWorker = new Worker('wasm-worker.js');
let detectedZone;
let cameraStopped = false;
const canvas = document.getElementById('canvas');
const context = canvas.getContext("2d");
const camera = new Camera(context, processVideo);
camera.getEumerateDevices();

/***
 *
 * @param video
 */
function processVideo(video){
    context.drawImage(video, 0, 0);
    let image = context.getImageData(0, 0, canvas.width, canvas.height);

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

    if(cameraStopped){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/***
 *
 */
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

/***
 *
 */
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

/***
 *
 * @returns {Promise<void>}
 */
async function onRuntimeInitialized() {
    console.log("Document Extractor Initialized!")
}

/***
 *
 * @param zone
 */
function setDetectedZone(zone){
    console.log("Detected zone", zone)
    detectedZone = zone
}

/***
 *
 */
function setListeners(){
    wasmWorker.addEventListener('message', async (e) => {
        switch(e.data.cmd) {
            case 'onRuntimeInitialized':
                await onRuntimeInitialized();
                break;
            case 'setDetectedZone':
                setDetectedZone(e.data.zone);
                break;
        }
    }, false);
}


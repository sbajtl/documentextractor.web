class Camera {
    constructor(context, callback) {
        this.context = context;
        this.callback = callback;

        // We can't `new Video()` yet, so we'll resort to the vintage
        // "hidden div" hack for dynamic loading.
        let streamContainer = document.createElement('div')
        this.video = document.createElement('video')
        this.video.id = "video"

        // If we don't do this, the stream will not be played.
        // By the way, the play and pause controls work as usual
        // for streamed videos.
        this.video.setAttribute('autoplay', '1')
        this.video.setAttribute('muted', '1');
        this.video.setAttribute('playsinline', '1') // important for iPhones

        // The video should fill out all of the canvas
        this.video.setAttribute('width', 1)
        this.video.setAttribute('height', 1)

        streamContainer.appendChild(this.video)
        document.body.appendChild(streamContainer)
    }

    setDevicesList(){
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            this.videoSourcesSelect = document.getElementById("video-source");

            // Iterate over all the list of devices (InputDeviceInfo and MediaDeviceInfo)
            devices.forEach((device) => {
                let option = new Option();
                option.value = device.deviceId;

                // According to the type of media device
                switch(device.kind){
                    // Append device to list of Cameras
                    case "videoinput":
                        option.text = device.label || `Camera ${this.videoSourcesSelect.length + 1}`;
                        this.videoSourcesSelect.appendChild(option);
                        break;
                }

                //console.log(device);
            });
        }).catch(function (e) {
            console.log(e.name + ": " + e.message);
        });
    }

    startCamera(){
        const videoSource = this.videoSourcesSelect.value;
        const constraints = {
            audio: false,
            video: {
                deviceId: videoSource ? {exact: videoSource} : undefined
            }
        };
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            this.video.srcObject = stream;
            // Let's start drawing the canvas!
            this.update();
        }, function(err) {
            throw err;
        })
    }

    stopCamera() {
        if (this.video.srcObject){
            // Pause video node
            this.video.pause();
            // Stop media stream
            this.video.srcObject.getTracks()[0].stop();
        }
    }

    // As soon as we can draw a new frame on the canvas, we call the `draw` function
    // we passed as a parameter.
    update() {
        let loop = () => {
            this.callback(this.video)
            requestAnimationFrame(loop)
        }
        requestAnimationFrame(loop)
    }
}
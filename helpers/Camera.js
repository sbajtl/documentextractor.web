class Camera {
    constructor(context, callback) {
        this.context = context;
        this.callback = callback;

        // We can't `new Video()` yet, so we'll resort to the vintage
        // "hidden div" hack for dynamic loading.
        let streamContainer = document.createElement('div')
        this.video = document.createElement('video')

        // If we don't do this, the stream will not be played.
        // By the way, the play and pause controls work as usual
        // for streamed videos.
        this.video.setAttribute('autoplay', '1')
        this.video.setAttribute('playsinline', '1') // important for iPhones

        // The video should fill out all of the canvas
        this.video.setAttribute('width', 1)
        this.video.setAttribute('height', 1)

        streamContainer.appendChild(this.video)
        document.body.appendChild(streamContainer)

    }

    startCamera(){
        navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
            this.video.srcObject = stream;
            // Let's start drawing the canvas!
            this.update();
        }, function(err) {
            throw err;
        })
    }

    stopCamera() {
        // Pause video node
        this.video.pause();
        // Stop media stream
        this.video.srcObject.getTracks()[0].stop();
    }

    // As soon as we can draw a new frame on the canvas, we call the `draw` function
    // we passed as a parameter.
    update() {
        let last = Date.now()
        let loop = () => {
            // For some effects, you might want to know how much time is passed
            // since the last frame; that's why we pass along a Delta time `dt`
            // variable (expressed in milliseconds)
            let dt = Date.now() - last
            this.callback(this.video, dt)
            last = Date.now()
            requestAnimationFrame(loop)
        }
        requestAnimationFrame(loop)
    }
}
class WasmHelper {

    startTime = 0;
    endTime = 0;

    constructor() {
    }

    ToHeap(typedArray) {
        const numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
        this._ptr = Module._malloc(numBytes);
        let heapBytes = Module.HEAPU8.subarray(this._ptr, this._ptr + numBytes);
        heapBytes.set(typedArray)
        return heapBytes;
    }

    Free(heapBytes) {
        Module._free(heapBytes.byteOffset);
    }

    ProcessFrame(image) {
        // console.time('ProcessFrame')
        this.startTime = performance.now();

        this._frame_bytes = this.ToHeap(image.data);
        let extractor = new Module.Extractor();
        let zone = extractor.detectMrzZone(this._frame_bytes.byteOffset, image.width, image.height);
        this.Free(this._frame_bytes);

        //postMessage({'cmd': 'drawProcessedFrame', 'image': imageData},[imageData.data.buffer]);
        postMessage({
            'cmd': 'setDetectedZone',
            'zone':
                {
                    x: zone.get_x(),
                    y: zone.get_y(),
                    width: zone.get_width(),
                    height: zone.get_height()
                }
        });

        this.Free(zone);
        Module.destroy(extractor);
        this.endTime = performance.now();

        // console.timeEnd('ProcessFrame')
        console.log("ProcessFrame", parseFloat((this.endTime - this.startTime)).toFixed(2), "ms")

        postMessage({'cmd': 'timeFinished', 'elapsedTime': parseFloat(1000 / (this.endTime - this.startTime)).toFixed(1)});
    }
};
class WasmHelper {

    /**
     *
     */
    constructor() {
    }

    /**
     *
     * @param typedArray
     * @returns {*}
     * @constructor
     */
    ToHeap(typedArray) {
        const numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
        const ptr = Module._malloc(numBytes);
        let heapBytes = Module.HEAPU8.subarray(ptr, ptr + numBytes);
        heapBytes.set(typedArray)
        return heapBytes;
    }

    /**
     *
     * @param heapBytes
     * @constructor
     */
    Free(heapBytes) {
        Module._free(heapBytes.byteOffset);
    }

    /**
     *
     * @param image
     * @constructor
     */
    ProcessFrame(image) {
        console.time('ProcessFrame')
        if (!this._frame_bytes) {
            this._frame_bytes = this.ToHeap(image.data);
        } else if (this._frame_bytes.length !== image.data.length) {
            this.Free(this._frame_bytes); // free heap memory
            this._frame_bytes = this.ToHeap(image.data);
        } else {
            this._frame_bytes.set(image.data);
        }
        let extractor = new Module.Extractor();

        extractor.getImage(this._frame_bytes.byteOffset, image.width, image.height);
        let zone = extractor.getDetectedZone();

        let zoneToSend = {
            x: zone.get_x(),
            y: zone.get_y(),
            width: zone.get_width(),
            height: zone.get_height()
        }

        //postMessage({'cmd': 'drawProcessedFrame', 'image': imageData},[imageData.data.buffer]);
        postMessage({'cmd': 'setDetectedZone', 'zone': zoneToSend});
        Module.destroy(extractor);
        console.timeEnd('ProcessFrame')
    }
};

let HelperModule = {
    WasmHelper: WasmHelper
}
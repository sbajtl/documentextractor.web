let extractor;
class WasmHelper {

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
        let zone = extractor.detectMrzZone(this._frame_bytes.byteOffset, image.width, image.height);
        //this.Free(this._frame_bytes);

        //postMessage({'cmd': 'drawProcessedFrame', 'image': imageData},[imageData.data.buffer]);
        postMessage({'cmd': 'setDetectedZone', 'zone':
            {
                x: zone.get_x(),
                y: zone.get_y(),
                width: zone.get_width(),
                height: zone.get_height()
            }
        });
        
        Module.destroy(zone);
        Module.destroy(extractor);
        console.timeEnd('ProcessFrame')
    }
};

//export default WasmHelper;

let HelperModule = {
    WasmHelper: WasmHelper
}
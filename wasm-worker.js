var Module = {
    onRuntimeInitialized: () => {
        postMessage({'cmd': 'onRuntimeInitialized'});

        let wasmHelper = new HelperModule.WasmHelper();

        addEventListener('message', onMessage);

        function onMessage(e) {
            switch(e.data.cmd){
                case "processFrame":
                    wasmHelper.ProcessFrame(e.data.image)
                    break;
            }
        }
    }
    };

importScripts('DocumentExtractor.js', '../helpers/WasmHelperClass.js');

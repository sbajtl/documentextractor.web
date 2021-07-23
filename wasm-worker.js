var Module = {
    onRuntimeInitialized: () => {
        postMessage({'cmd': 'onRuntimeInitialized'});
        
        addEventListener('message', onMessage);

        function onMessage(e) {
            switch(e.data.cmd){
                case "processFrame":
                    ProcessFrame(e.data.image)
                    break;
            }
        }
    }
    };

importScripts('DocumentExtractor.js', '../helpers/WasmHelper.js');

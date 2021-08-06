importScripts('wasm_exec.js');

self.onmessage = function (e) {
    console.log('receive message:')
    console.log(e)
    
    switch (e.data.message) {
        case 'init':
            self.go = new Go();
            WebAssembly.instantiateStreaming(fetch("demo-parser.wasm"), self.go.importObject).then((result) => {
                self.go.run(result.instance);
                postMessage({
                    'message': 'inited',
                });
            });
            break;

        case 'parse-demo':
            var startTime, endTime;
            startTime = performance.now();
            ParseDemoStat(
                e.data.bytes, 
                (err, stats) => {
                    endTime = performance.now();
                    var timeDiff = endTime - startTime; //in ms 
                    // strip the ms 
                    timeDiff /= 1000; 
                    
                    // get seconds 
                    var seconds = Math.round(timeDiff);
                    console.log(seconds + " seconds");
    
                    postMessage({
                        'message': 'parse-done',
                        'err': err,
                        'stats': stats,
                    });
                },
                (progress) => {
                    postMessage({
                        'message': 'parse-progress',
                        'progress': progress,
                    });
                }
            );
    }

}
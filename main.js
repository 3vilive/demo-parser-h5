var documentRef
var demoParserWorker 
document.addEventListener('DOMContentLoaded', function () {
	state('init');
	documentRef = document

	demoParserWorker = new Worker('demo-parser-worker.js');
	demoParserWorker.onmessage = function(e) {
		console.log('main thread receive message')
		console.log(e.data)

		switch (e.data.message) {
			case "inited":
				state('ready');
				displayProgress(0.0);
				break;

			case "parse-progress":
				displayProgress(e.data.progress);
				break;

			case "parse-done":
				ParseStatCallback(e.data.err, e.data.stats)
				break;
		}
	}

	demoParserWorker.postMessage({
		'message': 'init',
	})
}, false);



function parseFile() {
	console.log('reading demo');
	state("reading demo");


	const reader = new FileReader();
	reader.onload = function () {
		const data = reader.result;
		const bytes = new Uint8Array(data);
		console.log('parsing');
		state("parsing");
		// ParseDemoStat(
        //     bytes, 
        //     (err, stats) => {
        //         endTime = performance.now();
        //         var timeDiff = endTime - startTime; //in ms 
        //         // strip the ms 
        //         timeDiff /= 1000; 
                
        //         // get seconds 
        //         var seconds = Math.round(timeDiff);
        //         console.log(seconds + " seconds");

        //         ParseStatCallback(err, stats)
        //     },
        //     (progress) => {
        //         console.log("parsing progress " + progress * 100.0 + "%")
		// 		displayProgress(progress)
        //     }
        // );

		demoParserWorker.postMessage({
			'message': 'parse-demo',
			'bytes': bytes,
		})
	};
	reader.readAsArrayBuffer(document.getElementById('demofile').files[0])
}

function state(state) {
	document.getElementById('state').innerText = state;
}

function displayProgress(p) {
	const displsy = "" + p * 100.0 + " %";
	console.log("displayProgress called displsy: " + displsy)
	documentRef.getElementById('progress').innerText = displsy;
	documentRef.title = displsy;
	console.log(documentRef.getElementById('progress'))
}

function ParseStatCallback(err, statsJson) {
	console.log('displaying stats');
    console.log(err)
	const stats = JSON.parse(statsJson)
    console.log(stats)

	displayTeamStats('ct-stats', stats['team_ct']['players'])
	displayTeamStats('t-stats', stats['team_t']['players'])

	console.log('done');
	state("done");
}


function displayTeamStats(table_id, players)  {
	const table = document.getElementById(table_id);
	players.forEach(p => {
		const row = document.createElement('tr');
		row.appendChild(td(p.name));
		row.appendChild(td(p.kills));
		row.appendChild(td(p.assists));
		row.appendChild(td(p.deaths));
		row.appendChild(td(p.headshot));
		row.appendChild(td(p['first_kill']));
		row.appendChild(td(p['first_death']));
		row.appendChild(td(p['damage']));
		row.appendChild(td(p['mvp']));
		row.appendChild(td(p['adr']));
		table.appendChild(row);
	})
}

function td(val) {
	const td = document.createElement('td');
	td.innerText = val;
	return td;
}
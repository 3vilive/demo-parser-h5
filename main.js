document.addEventListener('DOMContentLoaded', function () {
	state('init');

	const go = new Go();
	WebAssembly.instantiateStreaming(fetch("demo-parser.wasm"), go.importObject).then((result) => {
		go.run(result.instance);
		state('ready')
	});
}, false);

function parseFile() {
	console.log('reading demo');
	state("reading demo");


    var startTime, endTime;
    startTime = performance.now();

	const reader = new FileReader();
	reader.onload = function () {
		const data = reader.result;
		const bytes = new Uint8Array(data);
		console.log('parsing');
		state("parsing");
		ParseDemoStat(
            bytes, 
            (err, stats) => {
                endTime = performance.now();
                var timeDiff = endTime - startTime; //in ms 
                // strip the ms 
                timeDiff /= 1000; 
                
                // get seconds 
                var seconds = Math.round(timeDiff);
                console.log(seconds + " seconds");

                ParseStatCallback(err, stats)
            },
            (progress) => {
                console.log("parsing progress " + progress * 100.0 + "%")
            }
        );
	};
	reader.readAsArrayBuffer(document.getElementById('demofile').files[0])
}

function state(state) {
	document.getElementById('state').innerText = state;
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
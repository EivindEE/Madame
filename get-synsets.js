/*jslint */
"use strict";
var http = require('http'),
	fs = require('fs'),
	nouns = require('./testing/uniqueNouns.js').nouns,
	i,
	synsets = [],
	saveSynsets = function (json) {
		var i,
		sense,
		synsets = [];
		for (i = 0; i < json.senses.length; i += 1) {
			sense = json.senses[i];
			if (sense.source === 'WordNet') {
				synsets.push(sense.senseid);	
			}
		}
		if (synsets.length) {
			fs.appendFile('testing/synsets', '\r' + synsets.join('\r'));
		}
	};
	
for (i = 0;i < nouns.length; i += 1) {
	http.get('http://lexitags.dyndns.org:8080/server/lexitags2/Semtags?data={"word": "' + nouns[i] + '"}', 
		function (response) {
			var body = '';
			if (response.statusCode !== 200) {
				console.log(response)
			} else {
				response.on('data', function (chunk) {
					body += chunk;
				});
				response.on('end', function () {
					saveSynsets(JSON.parse(body));
				}).on('error', function () {
					console.log('got error');
				});
			}
		});
}


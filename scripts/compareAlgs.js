"use strict";
var fs = require('fs'),
	wn = require('../app/wn'),
	synsets = require('../testing/synsets.js').synsets,
	schemaLevels = require('../testing/schemaLevels.js').schemaLevels,
	index = 0,
	numSynsets = 0,
	numLinNone = 0,
	numRecNone = 0,
	sumLinLevel = 0,
	sumRecLevel = 0,
	same = 0,
	different = 0,
	writeSense = function (i) {
		var stats;
		if (i < synsets.length) {

		wn.bestFit(synsets[i], function (err, json) {
				if (err) {
					console.log('Got err for synset: ' + synsets[i]);
				} else {
					var result = json.synset + '\n';
					if (json.lin.sumo) {
//						sumLinLevel += schemaLevels[json.lin.sumo]
						result += '\tlin: ' + json.lin.sumo + '\n';
					} else {
						numLinNone += 1;
						result += '\tlin: None\n';
					}
					if (json.rec.sumo) {
//						sumRecLevel += schemaLevels[json.rec.sumo]
						result += '\trec: ' + json.rec.sumo + '\n';
					} else {
						numRecNone += 1;
						result += '\trec: None\n';
					}
					if (json.rec.sumo !== json.lin.sumo) {
						different += 1;
						result += 'Different\n';
						fs.appendFile('testing/compare-sumo-different', result);
					} else {
						same += 1;
						result += 'Same\n';
						fs.appendFile('testing/compare-sumo-same', result);
					}
					console.log('Wrote result for ' + json.synset);
					fs.appendFile('testing/compare-sumo', result, function () {
						numSynsets += 1;
						writeSense(i+1);
					});
				}
			});
		} else {
//			console.log('sumLinLevel: ' + sumLinLevel);
	//		console.log('sumRecLevel: ' + sumRecLevel);
		//	console.log('numSynsets: ' + numSynsets);
			stats = 'Total#: ' + numSynsets + '\n';
			stats += 'Same#: ' + same + '\n';
			stats += 'Different#: ' + different + '\n';
//			stats += 'Avg level lin: ' + (sumLinLevel / numSynsets) + '\n';
//			stats += 'Avg level rec:' + (sumRecLevel / numSynsets) + '\n';
			stats += 'Total none results: ' + (numLinNone + numRecNone) + '(lin:' + numLinNone + ', rec:' + numRecNone + ')\n'; 
			console.log(stats);
			fs.appendFile('testing/compare-sumo-stats', stats);
		}
	};
	writeSense(index);

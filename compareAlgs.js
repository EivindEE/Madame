"use strict";
var fs = require('fs'),
	wn = require('./app/wn'),
	synsets = require('./testing/synsets.js').synsets,
	index = 0,
	writeSense = function (i) {
		if (i < synsets.length){
		wn.bestFit(synsets[i], function (err, json) {
				if (err) {
					console.log('Got err for synset: ' + synsets[i]);
				} else {
					var result = json.synset + '\r';
					if (json.lin.schema_dot_org) {
						result += '\tlin: ' + json.lin.schema_dot_org  + '\r';
					} else {
						result += '\tlin: None\r';
					}
					if (json.rec.schema_dot_org) {
						result += '\trec: ' + json.rec.schema_dot_org  + '\r';
					} else {
						result += '\trec: None\r';
					}
					if (json.rec.schema_dot_org !== json.lin.schema_dot_org) {
						result += 'Different\r';
						fs.appendFile('testing/compare-different', result);
					} else {
						result += 'Same\r';
						fs.appendFile('testing/compare-same', result);
					}
					console.log('Wrote result for ' + json.synset);
					fs.appendFile('testing/compare', result, function () {
						writeSense(i+1);
					});
				}
			});
		}
	};
	writeSense(index);
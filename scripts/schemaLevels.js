"use strict";
var http = require('http'),
	fs = require('fs'),
	findTypeDepths = function (json) {
		var level,
			type;
		console.log(json.types);
		for (type in json.types){
			if (json.types.hasOwnProperty(type)){
				level = json.types[type].ancestors.length;
				fs.appendFileSync('..testing/schemaLevels', '\t' + type + ':' + level + ',\n');
			}
		}
	};

http.get('http://schema.rdfs.org/all.json', function (response) {
	var body = '';
	if (response.statusCode !== 200) {
		console.log('Response not 200');
	} else {
		response.on('data', function (chunk) {
			body += chunk;
		});
		response.on('end', function () {
			findTypeDepths(JSON.parse(body))
		});
	}
})

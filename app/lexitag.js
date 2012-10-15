/*jslint regexp: true */

var http = require("http"),
	url = require('url'),
	schema = require('./schema.org').declaration;
function findSchemaDatatypes(searchTerm, callback) {
	'use strict';

	var schema_senses = [],
		sense,
		termName,
		term;
	try {
		for (termName in schema.datatypes) {
			if (schema.datatypes.hasOwnProperty(termName)) {
				term = schema.datatypes[termName];

				if (term.label.search(new RegExp("(\\s|^)" + searchTerm, "i")) !== -1) {
					sense = {};
					sense.senseid = "http://schema.org/" + term.id;
					sense.explanation = term.comment;
					schema_senses.push(sense);
				}
			}
		}
	} catch (e) {
	}
	callback(schema_senses);
}
function findSchemaProperties(searchTerm, callback) {
	'use strict';

	var schema_senses = [],
		sense,
		termName,
		term;
	try {
		for (termName in schema.properties) {
			if (schema.properties.hasOwnProperty(termName)) {
				term = schema.properties[termName];
				if (term.label.search(new RegExp("(\\s|^)" + searchTerm, "i")) !== -1) {
					sense = {};
					sense.senseid = "http://schema.org/" + term.id;
					sense.explanation = term.comment;
					schema_senses.push(sense);
				}
			}
		}
	} catch (e) {
	}
	callback(schema_senses);
}
function findSchemaTypes(searchTerm, callback) {
	'use strict';

	var schema_senses = [],
		sense,
		termName,
		term;
	try {
		for (termName in schema.types) {
			if (schema.types.hasOwnProperty(termName)) {
				term = schema.types[termName];
				if (term.label.search(new RegExp("(\\s|^)" + searchTerm, "i")) !== -1) {
					sense = {};
					sense.senseid = "http://schema.org/" + term.id;
					sense.explanation = term.comment;
					schema_senses.push(sense);
				}
			}
		}
	} catch (e) {
	}
	callback(schema_senses);
}
function schemaRunner(run, q, callback) {
	'use strict';
	var i,
		counter = 0,
		matches = [],
		onMatch = function (matchList) {

			counter += 1;
			matches = matches.concat(matchList);

			if (counter >= run.length) {
				callback(matches);
			}
		};
	for (i = 0; i < run.length; i += 1) {
		run[i](q, onMatch);
	}
}
function findSchemaTerms(searchString, callback) {
	'use strict';
	var searchTerm,
		findWord;
	findWord = /:%22(.*?)%22\}$/g;
	searchTerm = findWord.exec(searchString)[1];
	searchTerm = searchTerm.replace(/s$/, "s?"); // Catches a lot of plurals and makes them optional
	searchTerm = searchTerm.replace(/\./g, "\\.");
	schemaRunner([findSchemaDatatypes, findSchemaProperties, findSchemaTypes], searchTerm, function (schema_senses) {
		callback({senses: schema_senses});
	});
}
function findLexitagTerms(searchString, callback) {
	'use strict';
	var body = "";
	http.get('http://lexitags.dyndns.org:8080/server/lexitags2/Semtags' + searchString, function (response) {
		response.on('data', function (chunk) {
			body += chunk;
		});
		response.on('end', function () {
			callback(JSON.parse(body));
		}).on('error', function (e) {
			callback({});
		});
	});
}
function runQueries(run, query, callback) {
	'use strict';
	var i,
		counter = 0,
		json = {word: '', senses: []},
		onComplete = function (jsonResult) {
			counter += 1;
			json.word = jsonResult.word || json.word;
			json.senses = jsonResult.senses ? jsonResult.senses.concat(json.senses) : json.senses;
			if (counter === run.length) {
				callback(json);
			}
		};
	for (i = 0; i < run.length; i += 1) {
		run[i](query, onComplete);
	}
}
exports.lexitag = function (req, res) {
	'use strict';
	var q = url.parse(req.url, true);
	runQueries([findSchemaTerms, findLexitagTerms], q.search, function (json) {
		res.writeHead(200, {"Content-Type" : "application/json"});
		res.write(JSON.stringify(json));
		res.end();
	});
};
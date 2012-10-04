var http = require("http"),
	url = require('url'),
	schema = require('./schema.org').declaration;
function findSchemaTypes(searchTerm) {
	'use strict';
	var schema_senses = [],
		sense,
		termName,
		term;
	try {
		for (termName in schema.types) {
			if (schema.types.hasOwnProperty(termName)) {
				term = schema.types[termName];
				if (term.label.search(new RegExp("(\s|^)" + searchTerm, "i")) !== -1) {
					sense = {};
					sense.senseid = "http://schema.org/" + term.id;
					sense.explanation = term.comment;
					schema_senses.push(sense);
				}
			}
		}
	} catch (e) {

	}
	return schema_senses;
}
function findSchemaTerms(searchString, callback) {
	'use strict';
	var searchTerm,
		findWord,
		schema_senses;
	findWord = /:%22(.*?)%22\}$/g;
	searchTerm = findWord.exec(searchString)[1];
	searchTerm = searchTerm.replace(/s$/, "s?"); // Catches a lot of plurals and makes them optional
	searchTerm = searchTerm.replace(/\./g, "\\.");
	schema_senses = findSchemaTypes(searchTerm);
	callback(schema_senses);
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
		json = {word: "unset", senses: []},
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
	var body = "",
		q = url.parse(req.url, true);
	runQueries([findSchemaTerms, findLexitagTerms], q.search, function (json) {
		res.writeHead(200, {"Content-Type" : "application/json"});
		res.write(JSON.stringify(json));
		res.end();
	});
};
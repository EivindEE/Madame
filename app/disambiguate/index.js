/*jslint node: true, regexp: true */
'use strict';
var http = require("http"),
	url = require('url'),
	properties = require('../schema.properties/mapping').declaration.properties,
	datatypes = require('../schema.properties/mapping').declaration.datatypes,
	types = require('../schema.properties/mapping').declaration.types,
	saneString = function (searchString, callback) {
		if (searchString.length > 60) {
			callback(new Error('Search string <' + searchString + '> was to long'));
		} else {
			callback(null, searchString);
		}
	},
	findSchemaDatatypes = function (searchTerm, callback) {
		var schema_senses = [],
			sense,
			termName,
			term;
		try {
			for (termName in datatypes) {
				if (datatypes.hasOwnProperty(termName)) {
					term = datatypes[termName];
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
	},
	findSchemaProperties = function (searchTerm, callback) {
		var schema_senses = [],
			sense,
			termName,
			term;
		try {
			for (termName in properties) {
				if (properties.hasOwnProperty(termName)) {
					term = properties[termName];
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
	},
	findSchemaTypes = function (searchTerm, callback) {
		var schema_senses = [],
			sense,
			termName,
			term;
		try {
			for (termName in types) {
				if (types.hasOwnProperty(termName)) {
					term = types[termName];
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
	},
	schemaRunner = function (run, q, callback) {
		var i,
			counter = 0,
			matches = [],
			onMatch = function (matchList) {
				counter += 1;
				matches = matchList.concat(matches);
				if (counter >= run.length) {
					callback(matches);
				}
			};
		for (i = 0; i < run.length; i += 1) {
			run[i](q, onMatch);
		}
	},
	findSchemaTerms = function (searchString, callback) {
		var searchTerm;
		searchTerm = searchString;
		searchTerm = searchTerm.replace(/s$/, "s?"); // Catches a lot of plurals and makes them optional
		searchTerm = searchTerm.replace(/\./g, "\\.");
		schemaRunner([findSchemaDatatypes, findSchemaProperties, findSchemaTypes], searchTerm, function (schema_senses) {
			callback({senses: schema_senses});
		});
	},
	findLexitagTerms = function (searchString, callback) {
		var body = '',
			url = 'http://lexitags.dyndns.org:8080/server/lexitags2/Semtags?data={"word": "',
			queryEnd = '"}';
		saneString(searchString, function (error, saneSearchString) {
			if (error) {
				console.log(error);
				callback(JSON.parse('{"senses": []}'));
			} else {
				http.get(url + saneSearchString + queryEnd,
					function (response) {
						if (response.statusCode !== 200) {
							callback({});
						} else {
							response.on('data', function (chunk) {
								body += chunk;
							});
							response.on('end', function () {
								callback(JSON.parse(body));
							}).on('error', function () {
								callback({});
							});
						}
					});
			}
		});
	},
	runQueries = function (run, query, callback) {
		var i,
			counter = 0,
			json = {word: '', senses: []},
			onComplete = function (jsonResult) {
				counter += 1;
				json.word = jsonResult.word || json.word;
				json.senses = jsonResult.senses ? json.senses.concat(jsonResult.senses) : json.senses;
				if (counter === run.length) {
					callback(json);
				}
			};
		for (i = 0; i < run.length; i += 1) {
			run[i](query, onComplete);
		}
	};

/**
*	Finds a list of possible definitions of the term
*	@param {String} term: The term to define
*	@param {Function} callback($error, $definitions):
*	The function that is called when the definitions have been found
*	$error {Object}: An error object with the error encountered, or null
*	$definitions{Object}: An object of the form:
*	{
*		word {String}: The word to define
*		senses {Array}: An array containing the possible definitions. A definition is in the form
*		{
*			senseid {String}: A unique URL for the sense
*			explanation {String}: A short text explaining the definition
*		}
*	}
*/
exports.term = function (term, callback) {
	runQueries([findLexitagTerms], term, function (json) {
		callback(null, json);
	});
};
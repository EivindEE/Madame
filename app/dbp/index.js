/*jslint node: true */
"use strict";
var url = require('url'),
	dbpedia2schema = require('../../mappings/dbpedia2schema').mapping,
	http = require('http'),
	endpoint = 'http://live.dbpedia.org/sparql?',
	defaultGraph = 'default-graph-uri=http://dbpedia.org&',
	querystring = require("querystring"),
	format = 'format=application%2Fsparql-results%2Bjson&',
//	query = 'query=select+distinct+%3Ftype+where+%7B%3Chttp%3A%2F%2Fdbpedia.org%2Fresource%2FTom_Cruise%3E+a+%3Ftype%7D&',
	debug = 'debug=off&',
	timeout = 'timeout=0',
	dbp = function (resource) {
		var query = 'query=select+distinct+?type+where+{<' + resource + '>+a+?type}&',
			request =  endpoint + defaultGraph + query + format + timeout;
		http.get( request, 
		function (response, err) {
			var body = '';
			if (err) {
				console.log('Error: ');
				console.log(err);
			} else if (response) {
				response.on('data', function (chunk) {
					body += chunk;
				});
				response.on('end', function () {
					console.log(body);
				});
			} else {
				console.log('huh');
			}
		});
	};
/**
*	Finds the schema.org terms that maps to the DBPedia term given
*	@param {String} term: The DBPedia term
*	@param {Function} callback($error, $result):
*	The function that is called when the mappings have been found
*	$error: The error encountered or null
*	$result: An object of the form:
*	{
*		synset {String}: the DBPedia term that is mapped
*		senses {Array}: An array with the senses found with namespace prefix.
*		ns {Object}: An object containing the namespaces used. Prefix is key, URL is value
*	}
*/
exports.bestFit = function (term, callback) {
	var fit = {'synset': term, 'senses': [], origin: 'dbp/best-fit/' + term, 'ns': {'schema': 'http://schema.org/'}};
	fit.senses.push('dbp:' + term);
	fit.ns.dbp = 'http://dbpedia.org/resource/';
	if (dbpedia2schema[term]) {
		fit.senses.push('schema:' + dbpedia2schema[term]);
	}
	fit.senses.push('schema:Thing');
	callback(null, fit);
};
dbp('http://dbpedia.org/resource/Boxing');



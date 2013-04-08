/*jslint node: true */
"use strict";
var url = require('url'),
	dbpedia2schema = require('../../mappings/dbpedia2schema').mapping,
	http = require('http'),
	endpoint = 'http://live.dbpedia.org/sparql?',
	defaultGraph = 'default-graph-uri=http://dbpedia.org&',
	querystring = require("querystring"),
	format = 'format=application%2Fsparql-results%2Bjson&',
	debug = 'debug=off&',
	timeout = 'timeout=3',
	dbp = function (resource, callback) {
		var type = 'sense',
			query = 'query=select+distinct+?' + type +  '+where+{<' + resource + '>+a+?' + type + '}&',
			request =  endpoint + defaultGraph + query + format + timeout;
		http.get(request,
			function (response, err) {
				var body = '';
				if (err) {
					callback(err);
					return err;
				}
				response.on('data', function (chunk) {
					body += chunk;
				});
				response.on('end', function () {
					callback(null, JSON.parse(body));
				});
			}).on('error',
			function (err) {
				callback(err);
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
	fit.ns.dbp = 'http://dbpedia.org/resource/';
	dbp(fit.ns.dbp + term, function (err, json) {
		var bindings,
			i = 0,
			type;
		if (!err) {
			bindings = json.results.bindings;
			for (i = 0; i < bindings.length; i += 1) {
				type = bindings[i].sense.value;
				if (type.match('http://schema.org/')) {
					fit.senses.push('schema:' + type.substring(type.lastIndexOf('/') + 1));
				}
			}
		}
		if (fit.senses.length === 0) {
			fit.senses.push('schema:Thing');
		}
		fit.senses.push('dbp:' + term);
		callback(null, fit);
	});
};





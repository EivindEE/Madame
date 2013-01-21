/*jslint node: true */
"use strict";
var url = require('url'),
	dbpedia2schema = require('../../mappings/dbpedia2schema').mapping;
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
	var fit = {'synset': term, 'senses': [], 'ns':
		{
			'schema': 'http://schema.org/'
		}
		};
	if (dbpedia2schema[term]) {
		fit.senses.push('dbp:' + dbpedia2schema[term]);
		fit.ns.dbp = 'http://dbpedia.org/resource/';
	}
	fit.senses.push('schema:Thing');
	callback(null, fit);
};
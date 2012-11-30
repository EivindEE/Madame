/*jslint node: true */
"use strict";
var url = require('url'),
	dbpedia2schema = require('../../mappings/dbpedia2schema').mapping;
/**
	Finds the schema.org terms that maps to the DBPedia term given
	@param {String} term: The DBPedia term
	@param {Function} callback($error, $result):
	The function that is called when the mappings have been found
	$error: The error encountered or null
	$result: An object of the form:
	{
		term {String}: the DBPedia term that is mapped
		schema_dot_org: The schema.org term that the term mapps to
	}
*/
exports.bestFit = function (term, callback) {
	callback(null, {"term": term, "schema_dot_org": dbpedia2schema[term]});
};
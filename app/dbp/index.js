"use strict";
var url = require('url'),
	dbpedia2schema = require('../../mappings/dbpedia2schema').mapping;
exports.bestFit = function (term, callback) {
	callback(null, {"term": term, "schema_dot_org": dbpedia2schema[term]});
};
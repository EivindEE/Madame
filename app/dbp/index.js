"use strict";
var url = require('url'),
	dbpedia2schema = require('../../mappings/dbpedia2schema').mapping;
exports.bestFit = function (req, res) {
	var dbpTerm = url.parse(req.url, true).query.q,
		mappings = {"term": dbpTerm, "schema_dot_org": dbpedia2schema[dbpTerm]};
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.end(JSON.stringify(mappings));
};
'use strict';
var http = require('http'),
	url = require('url'),
	exec = require('child_process').exec,
	findParents = function (synset, callback) {
		exec('perl app/perl/parents ' + synset, function (error, stout, stderr) {
			if (error) {
				callback(new Error(error));
			} else {
				callback(null, stout);
			}
		});
	};

exports.hypernymes = function (req, res) {
	exec('perl app/perl/wn.pl', function (error, stout, stderr) {
		if (error) {
			console.log(error);
			res.writeHead(500, {"Content-Type": "application/json"});
			res.end(JSON.stringify(error));
		} else {
			res.writeHead(200, {"Content-Type": "application/json"});
			res.end(stout);
		}
	});
};

exports.hyponymes = function (req, res) {
	var body = '',
		endpoint = 'http://wordnet.rkbexplorer.com/sparql/?format=json&query=',
		query = url.parse(req.url, true).query,
		PREFIXES = 'PREFIX id: <http://wordnet.rkbexplorer.com/id/> PREFIX wn: <http://www.w3.org/2006/03/wn/wn20/schema/> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
		SPARQLQuery = 'SELECT * WHERE { ?o1 owl:sameAs <' + query.q + '>. ?o1 wn:gloss ?g1; owl:sameAs ?s1; rdfs:label ?l1. OPTIONAL { ?o1 wn:hyponymOf ?o2. ?o2 wn:gloss ?g2; owl:sameAs ?s2 ; rdfs:label ?l2} . OPTIONAL { ?o1 wn:hyponymOf ?o22. ?o22 wn:hyponymOf ?o3. ?o3 wn:gloss ?g3; owl:sameAs ?s3 ; rdfs:label ?l3} OPTIONAL { ?o1 wn:hyponymOf ?o222. ?o222 wn:hyponymOf ?o33. ?o33 wn:hyponymOf ?o4. ?o4 wn:gloss ?g4; owl:sameAs ?s4 ; rdfs:label ?l4} } ';
	console.dir(query);
	http.get(endpoint + encodeURIComponent(PREFIXES + SPARQLQuery), function (response) {
		response.on('data', function (chunck) {
			body += chunck;
		});
		response.on('end', function () {
			var rawJSON = JSON.parse(body).results.bindings[0],
				i,
				json = {};
			console.log(rawJSON);
			for (i = 1; i < 5; i += 1) {
				json['o' + i] = {"id": rawJSON['o' + i].value, "gloss": rawJSON['g' + i].value, "sameAs": rawJSON['s' + i].value, "label": rawJSON['l' + i].value};
			}
			res.writeHead(res.statusCode, {"Content-Type": "application/json"});
			res.end(JSON.stringify(json));
		});
	}).on('error', function (e) {
		res.writeHead(res.statusCode, {"Content-Type": "application/json"});
		res.end(e.message);
	});
};




exports.mapping = function (req, res) {
	var prefixes = 'PREFIX schema:<http://schema.org/> PREFIX :<http://schema.org/> PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> PREFIX swrl:<http://www.w3.org/2003/11/swrl#> PREFIX owl2xml:<http://www.w3.org/2006/12/owl2-xml#> PREFIX protege:<http://protege.stanford.edu/plugins/owl/protege#> PREFIX xsp:<http://www.owl-ontologies.com/2005/08/07/xsp.owl#> PREFIX swrlb:<http://www.w3.org/2003/11/swrlb#> PREFIX xsd:<http://www.w3.org/2001/XMLSchema#> PREFIX owl:<http://www.w3.org/2002/07/owl#> PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX wn30:<http://purl.org/vocabularies/princeton/wn30/>',
		urlQuery = url.parse(req.url, true).query,
		query = 'SELECT * WHERE {wn30:' + urlQuery.wn + ' owl:equivalentClass ?schema}',
		options = {
			port: 8088,
			host: 'collos.zapto.org',
			path: '/openrdf-sesame/repositories/wn?queryLn=SPARQL&limit=100&infer=true&query=' + encodeURIComponent(prefixes + query),
			headers: {
				accept : 'application/sparql-results+json'
			}
		},
		request = http.get(options,
			function (response) {
				var body = '';
				response.setEncoding('utf-8');
				response.on('data', function (chunch) {
					body += chunch;
				});
				response.on('end', function () {
					res.writeHead(200, {'Content-Type': 'application/json'});
					res.end(body);
				});
				response.on('error', function (error) {
					console.log(error);
				});
			}).on('error',
				function (error) {
				console.log(error);
			});
	findParents(urlQuery.wn);
	request.end();
};

exports.parents = function (req, res) {
	var synset = url.parse(req.url, true).query.q;
	findParents(synset, function (error, data) {
		if (error) {
			res.writeHead(500, {'Content-Type': 'application/json'});
			res.end('{"error": "Could not word with synset: ' + synset + '", "msg": ' + error + '}');
		} else {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(data);
		}
	});
};

exports.parent = function (req, res) {
	var synset = url.parse(req.url, true).query.q;
	exec('perl app/perl/parent ' + synset, function (error, stout, stderr) {
		if (error) {
			res.writeHead(500, {'Content-Type': 'application/json'});
			res.end('{"error": ' + error + '}');
		} else {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(stout);
		}
	});
};
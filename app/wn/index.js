var http = require('http'),
	url = require('url');
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
		})
		response.on('end', function () {
			var rawJSON = JSON.parse(body).results.bindings[0],
				i,
				json = {};
			console.log(rawJSON);
			for (i = 1; i < 5 ; i += 1) {
				json['o'+i] = {"id": rawJSON['o' + i].value, "gloss": rawJSON['g' + i].value, "sameAs": rawJSON['s' + i].value, "label": rawJSON['l' + i].value};
			}
			res.writeHead(res.statusCode, {"Content-Type": "application/json"});
			res.end(JSON.stringify(json));
		})
	}).on('error', function (e) {
		res.writeHead(res.statusCode, {"Content-Type": "application/json"});
		res.end(e.message);
	})
	
}
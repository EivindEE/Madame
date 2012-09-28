var http = require("http"),
	url = require('url');


exports.lexitag = function (req, res) {
	var body = "",
		q = url.parse(req.url, true);
	
	http.get('http://lexitags.dyndns.org:8080/server/lexitags2/Semtags' + q.search, function (inner_res) {
		inner_res.on('data', function (chunk) {
			body += chunk;
		});
		inner_res.on('end', function () {
			res.writeHead(200, {"Content-Type": "application/json"});
			res.write(body);
			res.end();
		});
	}).on('error', function (e) {
		console.err("Got error: " + e.message);
	});
}
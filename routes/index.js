/*jslint node: true */
"use strict";
var	pkg = require('./package.json'),
	url = require('url'),
	wn	= require('../app/wn'),
	dbp = require('../app/dbp'),
	disambiguate = require('../app/disambiguate'),
	proxy = require('../app/proxy'),
	exporter = require('../app/export'),
	properties = require('../app/schema.properties'),
	jsDir = 'js/',
	returnJSON = function (error, json, res) {
		if (error) {
			console.log(error);
			res.writeHead(500, {'Content-Type': "application/json"});
			res.end(JSON.stringify(error));
		} else {
			res.writeHead(200, {'Content-Type': "application/json"});
			res.end(JSON.stringify(json));
		}
	},
	wnFuncs = {
		'best-fit' : wn.bestFit,
		'parent' : wn.parent,
		'mappings': wn.mappings
	};

exports.wn = function (req, res) {
	var func = req.params.func,
		q = req.query.q || req.params.synset;

	if (wnFuncs[func]) {
		wnFuncs[func](q, function (error, json) {
			returnJSON(error, json, res);
		});
	} else {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end('404: ' + req.url + ' not found');
	}
};

exports.dbp = {
	bestFit: function (req, res) {
		var q = req.params.synset || req.query.q;
		dbp.bestFit(q, function (error, json) {
			returnJSON(error, json, res);
		});
	}
};

exports.disambiguate = {
	term: function (req, res) {
		var q = req.query.word;
		disambiguate.term(q, function (error, json) {
			returnJSON(error, json, res);
		});
	}
};

exports.proxy = function (req, res) {
	var url = req.query.q || req.params.url;
	if (url.substring(0, 4) !== 'http') {
		url = 'http://' + url;
	}
	proxy.get(url, function (error, dom) {
		if (error) {
			res.writeHead(500, {'Content-Type': "application/json"});
			res.end(JSON.stringify(error));
		} else {
			res.writeHead(200, {'Content-Type': "text/html"});
			res.end(JSON.stringify(dom));
		}
	});
};

exports.properties = function (req, res) {
	var term = req.params.properties || req.query.q;
	properties.propertiesList(term, function (err, properties) {
		if (err) {
			res.writeHead(500, {'Content-Type': "application/json"});
			res.end(JSON.stringify(err));
		} else {
			res.writeHead(200, {'Content-Type': "application/json"});
			res.end(JSON.stringify(properties));
		}
	});
};

// Static routes
exports.index = function (req, res) {
	req = null;
	res.render(
		'semtag',
		{
			title: 'Meta data made simple',
			scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', jsDir + 'dist/' + pkg.name + '.min.js']
		}
	);
};

exports.exporter = function (req, res) {
	var html = {'body': req.body.q};
	html.head = req.body.head || '';
	html.scripts = req.body.scripts || '';
	html.URI = req.body.URI || '';
	html.prefixes = req.body.prefixes || '';
	exporter.save(html, function (err, response) {
		if (err) {
			res.writeHead(500, {'Content-Type': 'text/plain'});
			res.end(JSON.stringify(err));
		} else {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(JSON.stringify(response));
		}
	});
};

exports.loader = function (req, res) {
	exporter.load(req.query.q, function (err, document) {
		if (err) {
			res.render(
				'export',
				{
					'content': 'Error :('
				}
			);
		} else {
			res.render(
				'export',
				{
					'head': document.head,
					'body': document.body,
					'prefixes': document.prefixes || 'none found'
				}
			);
		}
	});
};

exports.sw = function (req, res) {
	req = null;
	res.render(
		'sw',
		{
			title: 'Meta data made simple',
			scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', jsDir + 'dist/' + pkg.name + '.js', jsDir + 'sw-app.js']
		}
	);
};
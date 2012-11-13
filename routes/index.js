/*jslint node: true */
"use strict";
var url = require('url'),
	wn	= require('../app/wn'),
	dbp = require('../app/dbp'),
	disambiguate = require('../app/disambiguate'),
	proxy = require('../app/proxy'),
	returnJSON = function (error, json, res) {
		if (error) {
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
		q = req.query.q;
	console.log(wnFuncs[func]);
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
		var q = req.query.q;
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
	proxy.get(url, function (error, html) {
		if (error) {
			res.writeHead(500, {'Content-Type': "application/json"});
			res.end(JSON.stringify(error));
		} else {
			res.writeHead(200, {'Content-Type': "text/html"});
			res.end(html);
		}
	});
};


// Static routes
exports.index = function () {
	res.render('semtag', { title: 'SemTag', scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'javascripts/dist/SemTag.min.js']});
};

exports.sw = function () {
	res.render('sw', { title: 'Single Word SemTag', scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'javascripts/dist/SemTag.js']});
};

exports.test = function () {
	res.render('testrunner', {title: 'SpecRunner', specs: ['javascripts/spec/semtag_spec.js'], sources: ['javascripts/semtag.js', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'] });
};
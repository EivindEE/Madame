"use strict";
var url = require('url'),
	wn	= require('../app/wn');

exports.index = function (req, res) {
	res.render('semtag', { title: 'SemTag', scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'javascripts/dist/SemTag.min.js']});
};

exports.sw = function (req, res) {
	res.render('sw', { title: 'Single Word SemTag', scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'javascripts/dist/SemTag.js']});
};

exports.wn = {
	bestFit : function (req, res) {
		var q = url.parse(req.url, true).query.q;
		wn.bestFit(q, function (error, bestFit) {
			if (error) {
				res.writeHead(500, {'Content-Type': "application/json"});
				res.end(JSON.stringify(error));
			} else {
				res.writeHead(200, {'Content-Type': "application/json"});
				res.end(JSON.stringify(bestFit));
			}
		});
	},
	parent : function (req, res) {
		var q = url.parse(req.url, true).query.q;
		wn.parent(q, function (error, parent) {
			if (error) {
				res.writeHead(500, {'Content-Type': "application/json"});
				res.end(JSON.stringify(error));
			} else {
				res.writeHead(200, {'Content-Type': "application/json"});
				res.end(JSON.stringify(parent));
			}
		});
	},
	mappings : function (req, res) {
		var q = url.parse(req.url, true).query.q;
		wn.mappings(q, function (error, mapping) {
			if (error) {
				res.writeHead(500, {'Content-Type': "application/json"});
				res.end(JSON.stringify(error));
			} else {
				res.writeHead(200, {'Content-Type': "application/json"});
				res.end(JSON.stringify(mapping));
			}
		});
	}
};

exports.test = function (req, res) {
	res.render('testrunner', {title: 'SpecRunner', specs: ['javascripts/spec/semtag_spec.js'], sources: ['javascripts/semtag.js', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'] });
};
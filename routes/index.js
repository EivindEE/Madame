"use strict";
var url = require('url'),
	wn	= require('../app/wn'),
	dbp = require('../app/dbp'),
	disambiguate = require('../app/disambiguate'),
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


exports.index = function (req, res) {
	res.render('semtag', { title: 'SemTag', scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'javascripts/dist/SemTag.min.js']});
};

exports.sw = function (req, res) {
	res.render('sw', { title: 'Single Word SemTag', scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'javascripts/dist/SemTag.js']});
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
		var q = req.query.q;
		disambiguate.term(q, function (error, json) {
			returnJSON(error, json, res);
		});
	}
};

exports.test = function (req, res) {
	res.render('testrunner', {title: 'SpecRunner', specs: ['javascripts/spec/semtag_spec.js'], sources: ['javascripts/semtag.js', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'] });
};
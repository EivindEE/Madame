/*jslint nomen: true, es5:true*/
'use strict';
/**
 * Module dependencies.
 */

var express = require('express'),
	gzippo = require('gzippo'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	tag = require('./app/lexitag'),
	wn = require('./app/wn'),
	dbp = require('./app/dbp'),
	exec = require('child_process').exec;

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.set('jsonp callback', true);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
//	app.use(gzippo.staticGzip(path.join(__dirname, 'public')));
//	app.use(gzippo.compress());
});

app.configure('development', function () {
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/test', routes.test);
app.get('/sw', routes.sw);
app.get('/lex', tag.lexitag);
app.get('/wn/mappings', routes.wn.mappings);
app.get('/wn/best-fit', routes.wn.bestFit);
app.get('/wn/parent', routes.wn.parent);
app.get('/dbp/best-fit', dbp.bestFit);

http.createServer(app).listen(app.get('port'), function () {
	console.log("Express server listening on port " + app.get('port'));
});

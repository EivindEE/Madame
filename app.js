/*jslint node:true, nomen: true, es5:true*/
'use strict';
/**
 * Module dependencies.
 */

var express = require('express'),
	gzippo = require('gzippo'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.set('jsonp callback', true);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger(':remote-addr - [:date] ":method :url HTTP/:http-version" :status - :response-time ms -- ":referrer" ":user-agent"'));
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

app.get('/', routes.sw);
app.get('/test', routes.test);
app.get('/sw', routes.sw);
app.get('/lex', routes.disambiguate.term);
app.get('/wn/:func', routes.wn);
app.get('/wn/:func/:synset', routes.wn);
app.get('/dbp/best-fit/:synset', routes.dbp.bestFit);
app.get('/dbp/best-fit', routes.dbp.bestFit);
app.get('/properties/:properties', routes.properties);
app.get('/proxy/:url', routes.proxy);
app.get('/proxy', routes.proxy);
app.get('/export', routes.exporter);
app.post('/export', routes.exporter);
app.get('/load', routes.loader);

http.createServer(app).listen(app.get('port'), function () {
	console.log("Express server listening on port " + app.get('port'));
});

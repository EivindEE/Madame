/*jslint node: true, regexp: true */
'use strict';
var mongoose = require('mongoose'),
	db = mongoose.createConnection('mongodb://localhost:3001/pages'),
	documentSchema = new mongoose.Schema({
		'body': String,
		'head': String,
		'created': {'type': Date, 'default': Date.now}
	}),
	Document = db.model('Document', documentSchema);

db.on('error', console.error.bind(console, 'connection error:'));

exports.save = function (html, callback) {
	var documentObject = {'body': ''},
		head = html.head,
		URI = html.URI,
		document;
	documentObject.head = head.replace(/(<link[^>]* href\s*=\s*[\"\'])(\/[^>]*)/g, '$1' + URI + '$2');
	document = new Document(documentObject);
	document.save(function (err, doc) {
		if (err) {
			callback(err);
		} else {
			html.body = html.body.replace(/<img [^>]*class="removeIcon"[^>]*>/g, ''); // Removes x images
			html.body = html.body.replace(/(<span [^>]*class="tagged"[^>]* about="[^#]*)([^>]*">)/g, '$1load?q=' + doc.id + '$2'); // Removes x images
			html.body = html.body.replace(/<!\-\-SCRIPT/g, '');
			html.body = html.body.replace(/SCRIPT\-\->/g, '');
			Document.update({'_id': doc.id}, {$set: {'body': html.body}}, {upsert: true}, function (error) {
				if (error) {
					callback(error);
				}
				callback(null, doc.id);
			});
		}
	});
};

exports.load = function (id, callback) {
	Document.findOne({'_id': id}, function (err, document) {
		if (err) {
			callback(err);
		}
		callback(null, document);
	});
};
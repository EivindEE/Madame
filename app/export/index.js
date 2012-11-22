/*jslint node: true, regexp: true */
'use strict';
var mongoose = require('mongoose'),
	db = mongoose.createConnection('mongodb://localhost:3001/pages'),
	documentSchema = new mongoose.Schema({
		'body': String,
		'created': {'type': Date, 'default': Date.now}
	}),
	Document = db.model('Document', documentSchema);

db.on('error', console.error.bind(console, 'connection error:'));

exports.save = function (body, callback) {
	var document = new Document({'body': ''});
	document.save(function (err, doc) {
		if (err) {
			callback(err);
		} else {
			body = body.replace(/<img [^>]*class="removeIcon"[^>]*>/g, ''); // Removes x images
			body = body.replace(/(<span [^>]*class="tagged"[^>]* about="[^#]*)([^>]*">)/g, '$1load?q=' + doc.id + '$2'); // Removes x images
			Document.update({'_id': doc.id}, {$set: {'body': body}}, {upsert: true}, function (error, newDoc) {
				if (error) {
					callback(error);
				}
				callback(null, newDoc.id);
			});
		}
	});
};

exports.load = function (id, callback) {
	Document.findOne({'_id': id}, function (err, document) {
		if (err) {
			callback(err);
		}
		callback(null, document.body);
	});
};
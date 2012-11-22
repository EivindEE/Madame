/*jslint node: true */
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
	var document = new Document({'body': body});
	document.save(function (err, doc) {
		if (err) {
			callback(err);
		} else {
			callback(null, doc.id);
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
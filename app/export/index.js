/*jslint node: true, regexp: true */
'use strict';

var props = require('../properties'),
	mongoose = require('mongoose'),
	db = mongoose.createConnection(props.dbLocation + props.documents),
	documentSchema = new mongoose.Schema({
		'body': String,
		'head': String,
		'prefixes': String,
		'created': {'type': Date, 'default': Date.now}
	}),
	Document = db.model('Document', documentSchema);
db.on('error', console.error.bind(console, 'connection error:'));

/**
*	Takes a Object {head, body, URI} and saves it as a document in the db.
*	Replaces internal comments with HTML comments
*	@param {Object} html, an object with the keys {head, body, URI}
*	@param {Function} callback($error, $idString): called after document has been put in db
*	$error if error occurred
*	$id is the ObjectId of the document in the db
*/
exports.save = function (html, callback) {
	var documentObject = {'body': ''},
		head = html.head,
		URI = html.URI,
		prefixes = html.prefixes,
		document;
	documentObject.head = head.replace(/(<link[^>]* href\s*=\s*[\"\'])(\/[^>]*)/g, '$1' + URI + '$2');
	document = new Document(documentObject);
	document.save(function (err, doc) {
		if (err) {
			callback(err);
		} else {
			html.body = html.body.replace(/<img [^>]*class="removeIcon"[^>]*>/g, ''); // Removes x images
			html.body = html.body.replace(/(<span [^>]*class="tagged"[^>]* about="[^#]*)([^>]*">)/g, '$1load?q=' + doc.id + '$2'); // Removes x images
			html.body = html.body.replace(props.intertalCommentStart, '');
			html.body = html.body.replace(props.intertalCommentEnd, '');
			html.body = html.body.replace(props.htmlCommentStart, '<!--');
			html.body = html.body.replace(props.htmlCommentEnd, '-->');
			Document.update({'_id': doc.id}, {$set: {'body': html.body, 'prefixes': prefixes}}, {upsert: true}, function (error) {
				if (error) {
					callback(error);
				}
				callback(null, doc.id);
			});
		}
	});
};


/**
*	Returns the document object with the given id
*	@param
*	@param callback($error, $document): Called when the document has been fetched from the db.
*	$error: The error that occurred of null,
*	$document: The document that was retrieved from the db
*/
exports.load = function (id, callback) {
	Document.findOne({'_id': id}, function (err, document) {
		if (err) {
			callback(err);
		}
		callback(null, document);
	});
};

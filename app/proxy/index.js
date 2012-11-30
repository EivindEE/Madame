/*jslint node: true */
"use strict";
var	jsdom = require('jsdom'),
	props = require('../properties');

/**
*	Retrieves the HTML from a given source.
*	Comments out scripts and iframes
*	Undocumented behavior for URLs that don't point to html
*	@param url, the URL to the HTML document
*	@param {Function} callback($error, $document): called after the attempt to retrieve the URL
*	$error: The error reported by jsdom or null
*	$document: An object of the document in the form:
*	{
*		head {String}: The head of the HTML document
*		body {String}: The body of the document, with iframe and script tags commented outerHTML
*		URI {String} : The URI of the document 
*	}
*/
exports.get = function (url, callback) {
	var document,
		protocol,
		host,
		port,
		URI,
		count,
		tags,
		tag,
		i,
		dom = {};
	jsdom.env({
		html: url,
		done: function (errors, window) {
			if (errors) {
				callback(errors);
			} else {
				document = window.document;
				protocol = document.location.protocol;
				host = document.location.host;
				port = document.location.port;
				URI = protocol + '//' + host;
				console.log(props);
				if (port) {
					URI += ':' + port;
				}
				tags = document.body.getElementsByTagName('script');
				count = tags.length;
				for (i = 0; i < count; i += 1) {
					tags[i].innerHTML = tags[i].innerHTML.replace(/<!\-\-/g, props.htmlCommentStart).replace(/\-\->/g, props.htmlCommentEnd);
					tags[i].parentNode.replaceChild(document.createComment('SCRIPT' + tags[i].outerHTML + 'SCRIPT'), tags[i]);
				}
				tags = document.body.getElementsByTagName('iframe');
				count = tags.length;
				for (i = 0; i < count; i += 1) {
					tags[i].innerHTML = tags[i].innerHTML.replace(/<!\-\-/g, props.htmlCommentStart).replace(/\-\->/g, props.htmlCommentEnd);
					tags[i].parentNode.replaceChild(document.createComment('SCRIPT' + tags[i].outerHTML + 'SCRIPT'), tags[i]);
				}

				if (document && document.images) {
					count = document.images.length;
					for (i = 0; i < count; i += 1) {
						tag = document.images[i].src;
						if (tag.charAt(0) === '/') {
							document.images[i].src = url + tag;
						}
					}
					dom.URI = URI;
					if (document.head) {
						dom.head = document.head.innerHTML;
					}
					if (document.body) {
						dom.body = document.body.innerHTML;
						callback(null, dom);
					} else {
						callback(new Error("Page didn't have a body element"));
					}
				} else {
					callback(new Error('No document found in window'));
				}
			}
		}
	});
};
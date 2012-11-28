/*jslint node: true */
"use strict";
var	jsdom = require('jsdom');

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
				if (port) {
					URI += ':' + port;
				}
				tags = document.body.getElementsByTagName('script');
				count = tags.length;
				for (i = 0; i < count; i += 1) {
					tags[i].innerHTML = tags[i].innerHTML.replace(/<!\-\-/g, 'SEMTAG-START-COMMENT').replace(/\-\->/g, 'SEMTAG-END-COMMENT');
					tags[i].parentNode.replaceChild(document.createComment('SCRIPT' + tags[i].outerHTML + 'SCRIPT'), tags[i]);
				}
				tags = document.body.getElementsByTagName('iframe');
				count = tags.length;
				for (i = 0; i < count; i += 1) {
					tags[i].innerHTML = tags[i].innerHTML.replace(/<!\-\-/g, 'SEMTAG-START-COMMENT').replace(/\-\->/g, 'SEMTAG-END-COMMENT');
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
/*jslint node: true */
"use strict";
var	jsdom = require('jsdom');

exports.get = function (url, callback) {
	var document,
		count,
		tags,
		tag,
		i;
	jsdom.env({
		html: url,
		done: function (errors, window) {
			if (errors) {
				callback(errors);
			} else {
				document = window.document;
				tags = document.getElementsByTagName('script');
				count = tags.length;
				for (i = 0; i < count; i += 1) {
					tags[i].parentNode.removeChild(tags[i]);
				}
				tags = document.getElementsByTagName('iframe');
				count = tags.length;
				for (i = 0; i < count; i += 1) {
					tags[i].parentNode.removeChild(tags[i]);
				}

				if (document && document.images) {
					count = document.images.length;
					for (i = 0; i < count; i += 1) {
						tag = document.images[i].src;
						if (tag.charAt(0) === '/') {
							document.images[i].src = url + tag;
						}
					}
					if (document.body) {
						callback(null, document.body.innerHTML);
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
/*jslint node: true */
"use strict";
var	jsdom = require('jsdom');

exports.get = function (url, callback) {
	var document,
		count,
		tag,
		i;
	jsdom.env({
		html: url,
		done: function (errors, window) {
			if (errors) {
				callback(errors);
			} else {
				document = window.document;
				count = document.images.length;
				for (i = 0; i < count; i += 1) {
					tag = document.images[i].src;
					if (tag.charAt(0) === '/') {
						document.images[i].src = url + tag;
					}
				}
				callback(null, window.document.body.innerHTML);
			}
		}
	});
};
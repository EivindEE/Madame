"use strict";
var	jsdom = require('jsdom');

exports.get = function (url, callback) {
	console.log(url);
	jsdom.env({
		html: url,
		done: function (errors, window) {
			if (errors) {
				callback(errors);
			} else {
				callback(null, window.document.body.innerHTML);
			}
		}
	});
};
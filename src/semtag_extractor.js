/*jslint browser: true */
var semtag = function (text, trigger) {
	"use strict";
	if (!(text && trigger)) {
		throw {name : "MissingArgumentsException", message : "Function requires both a valid text and trigger argument"};
	}

	self.ancestorOrSelf = function (ancestor, descendant) {
		if (ancestor === descendant) {
			return true;
		}
		if (descendant.parentNode) {
			return this.ancestorOrSelf(ancestor, descendant.parentNode);
		}
		return false;
	};
	self.surround = function (fragment, type, cName) {
		if (!fragment) {
			throw {name: "MissingArgumentsException", message: "Function requires a range object to surround with tags"};
		}
		var tag = document.createElement(type);
		tag.className =  cName || "";
		tag.appendChild(fragment);
		return tag;
	};
	return self;
};
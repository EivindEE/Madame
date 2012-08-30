var semtag = function (text, trigger) {
	"use strict";
	if (!(text && trigger)) {
		throw {name : "MissingArgumentsException", message : "Function requires both a valid text and trigger argument"};
	}
	var textfield = document.getElementById(text),
		button = document.getElementById(trigger),
		self = {};

	self.test = function () {
		return true;
	};
	self.textfield = textfield;
	
	self.ancestorOrSelf = function (ancestor, descendant) {
		if (ancestor === descendant) {
			return true;
		}
		if (descendant.parentNode) {
			return this.ancestorOrSelf(ancestor, descendant.parentNode);
		}
		
		return false;
	};

	return self;
};
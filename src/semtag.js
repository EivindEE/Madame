/*jslint browser: true */
var semtag = function (text, trigger) {
	"use strict";
	if (!(text && trigger)) {
		throw {name : "MissingArgumentsException", message : "Function requires both a valid text and trigger argument"};
	}
	var that = { extractor: {}},
		closestChild = function (node, descendant) {
			var parent;
			if (descendant.parentElement) {
				parent = descendant.parentElement;
				if (node === parent) {
					return descendant;
				}
				return closestChild(node, parent);
			}
			return false;
		};
	that.extractor.ancestorOrSelf = function (ancestor, descendant) {
		if (ancestor === descendant) {
			return true;
		}
		if (descendant.parentNode) {
			return this.ancestorOrSelf(ancestor, descendant.parentNode);
		}
		return false;
	};
	that.extractor.legalRange = function (range) {
		var newRange = range.cloneRange(),
			child;
		if (range.startContainer === range.endContainer) {
			return newRange;
		}
		child = closestChild(range.startContainer.parentElement, range.endContainer.parentElement);
		if (child) {
			newRange.setEndAfter(child);
			return newRange;
		}
		child = closestChild(range.endContainer.parentElement, range.startContainer.parentElement);
		if (child) {
			newRange.setStartBefore(child);
			return newRange;
		}
		newRange.setStartBefore(range.startContainer.parentElement);
		newRange.setEndAfter(range.endContainer.parentElement);
		return newRange;
	};
	that.extractor.surround = function (fragment, type, cName) {
		if (!fragment) {
			throw {name: "MissingArgumentsException", message: "Function requires a range object to surround with tags"};
		}
		var tag = document.createElement(type);
		tag.className =  cName || "";
		tag.appendChild(fragment);
		return tag;
	};
	return that;
};
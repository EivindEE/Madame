/*jslint browser: true */
/*global HTMLElement: true*/
var semtag = function (container, trigger, options) {
	"use strict";
	console.dir(container);
	if (!container) {
		throw {name : "MissingArgumentsException", message : "Function requires both a valid container and trigger argument"};
	}
	if (!(container instanceof HTMLElement)) {
		throw {name : "InvalidTypeException", message : "Container must be a HTMLElement"};
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
		},
		nodeName,
		className;

	options = options || {};
	nodeName  = options.nodeName || "span";
	className = options.className || "semtag";

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
		console.log("Legal range called");
		var newRange = range.cloneRange(),
			child,
			start,
			end;
		if (range.startContainer === range.endContainer) {

			return newRange;
		}
		child = closestChild(range.endContainer.parentElement, range.startContainer.parentElement);
		if (child) {
			newRange.setStartBefore(child);
			return newRange;
		}
		child = closestChild(range.startContainer.parentElement, range.endContainer.parentElement);
		if (child) {
			newRange.setEndAfter(child);
			return newRange;
		}
		start = closestChild(range.commonAncestorContainer, range.startContainer);
		end = closestChild(range.commonAncestorContainer, range.endContainer);
		newRange.setStartBefore(start);
		newRange.setEndAfter(end);
		return newRange;
		
	};
	that.extractor.surround = function (fragment) {
		if (!fragment) {
			throw {name: "MissingArgumentsException", message: "Function requires a range object to surround with tags"};
		}
		var tag = document.createElement(nodeName);
		tag.className = className;
		tag.appendChild(fragment);
		return tag;
	};

	that.extractor.extract = function () {
		var i,
			elements = [],
			nodes =  container.getElementsByClassName(className),
			nodenum = nodes.length;
		for (i = 0; i < nodenum; i += 1) {
			elements[i] = nodes[i];
		}
		return elements;
	};

	that.extractor.tagSelection = function () {
		var sel = window.getSelection(),
			range,
			content,
			el;
		if (sel.rangeCount > 0) {
			range = sel.getRangeAt(0);
			if (!(that.extractor.ancestorOrSelf(container, range.commonAncestorContainer))) {
				throw {name: "InvalidSelectionException", message: "Selection is outside of the scope of the semtag container"};
			}
			content = range.extractContents();
			el = that.extractor.surround(content);
			range.insertNode(el);
			return el;
		}
		throw {name: "InvalidSelectionException", message: "Function should not be called when nothing is selected"};
	};

	that.extractor.correctSelection = function () {
		var selection = window.getSelection(),
			range,
			rangeStart,
			rangeEnd;

		if (selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
			rangeStart = range.startContainer;
			rangeEnd = range.endContainer;
			if (that.extractor.ancestorOrSelf(container, rangeStart) && that.extractor.ancestorOrSelf(container, rangeEnd)) {
				if (rangeStart.parentElement !== rangeEnd.parentElement) {
					range = that.extractor.legalRange(range);
					selection.removeAllRanges();
					selection.addRange(range);
					return range;
				}
				return range;
			}
			throw {name: "InvalidSelectionException", message: "Selection must be fully within the container"};
		}

	};

	return that;
};
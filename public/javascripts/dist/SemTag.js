/*jslint browser: true */
/*global HTMLElement: true*/
var semtag = function (container, options) {
	"use strict";
	if (!container) {
		throw {name : "MissingArgumentsException", message : "Function requires a valid container argument"};
	}
	if (!(container instanceof HTMLElement)) {
		throw {name : "InvalidTypeException", message : "Container must be a HTMLElement"};
	}
	var that = { extractor: {}},
		closestChild = function (node, descendant) {
			console.log(node === descendant);
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
		className,
		idCounter = 0;
	options = options || {};
	nodeName  = options.nodeName || "span";
	className = options.className || "semtag";
	that.ancestorOrSelf = function (ancestor, descendant) {
		if (ancestor === descendant) {
			return true;
		}
		if (descendant.parentNode) {
			return this.ancestorOrSelf(ancestor, descendant.parentNode);
		}
		return false;
	};
	that.legalRange = function (range) {
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
		console.log("*****");
		console.log(range.commonAncestorContainer);
		console.log(range.startContainer);
		console.log(range.endContainer);
		start = closestChild(range.commonAncestorContainer, range.startContainer);
		end = closestChild(range.commonAncestorContainer, range.endContainer);
		newRange.setStartBefore(start);
		newRange.setEndAfter(end);
		return newRange;
	};
	that.surround = function (fragment) {
		if (!fragment) {
			throw {name: "MissingArgumentsException", message: "Function requires a range object to surround with tags"};
		}
		var tag = document.createElement(nodeName);
		tag.className = className;
		tag.setAttribute("id", className + idCounter);
		idCounter += 1;
		tag.appendChild(fragment);
		return tag;
	};
	that.extract = function () {
		var i,
			elements = [],
			nodes =  container.getElementsByClassName(className),
			nodenum = nodes.length;
		for (i = 0; i < nodenum; i += 1) {
			elements[i] = nodes[i].cloneNode(true);
		}
		return elements;
	};
	that.tagSelection = function () {
		var sel = window.getSelection(),
			range,
			content,
			el;
		if (sel.rangeCount > 0) {
			range = sel.getRangeAt(0);
			if (!(that.ancestorOrSelf(container, range.commonAncestorContainer))) {
				throw {name: "InvalidSelectionException", message: "Selection is outside of the scope of the semtag container"};
			}
			content = range.extractContents();
			el = that.surround(content);
			range.insertNode(el);
			return el;
		}
		throw {name: "InvalidSelectionException", message: "Function should not be called when nothing is selected"};
	};
	that.correctSelection = function () {
		var selection = window.getSelection(),
			range,
			rangeStart,
			rangeEnd;
		if (selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
			rangeStart = range.startContainer;
			rangeEnd = range.endContainer;
			if (that.ancestorOrSelf(container, rangeStart) && that.ancestorOrSelf(container, rangeEnd)) {
				if (rangeStart.parentElement !== rangeEnd.parentElement) {
					range = that.legalRange(range);
					selection.removeAllRanges();
					selection.addRange(range);
					return range;
				}
				return range;
			}
			throw {name: "InvalidSelectionException", message: "Selection must be fully within the container"};
		}
	};
	return {
		correctSelection : that.correctSelection,
		tagSelection : that.tagSelection,
		extract : that.extract,
		surround : that.surround,
		legalRange : that.legalRange,
		ancestorOrSelf: that.ancestorOrSelf
	};
};
/*global  $ */
var semtag = semtag || {};
semtag.buildTag = function (id, parentId, options) {
	'use strict';
	var el,
		type,
		className;
	type = options.type || 'div';
	className = options.className || '';
	el = document.createElement(type);
	el.setAttribute('id', id);
	el.className = className;
	document.getElementById(parentId).appendChild(el);
	return el;
};
semtag.getId = function (content) {
	'use strict';
	var id,
		baseString,
		counter = 1;
	baseString = 'semtag-' + content.replace(/ /g, '_') + '-';
	id =  baseString + counter;
	while (document.getElementById(id)) {
		counter += 1;
		id =  baseString + counter;
	}
	return id;
};
semtag.removeSense = function (sense) {
	'use strict';
	var taggedNode,
		taggedNodeParent,
		content;
	taggedNode = sense.parentNode.parentNode;
	taggedNodeParent = taggedNode.parentNode;
	content = document.createTextNode(taggedNode.textContent);
	taggedNodeParent.replaceChild(content, taggedNode);
};
semtag.wordSenseClicked = function (wordSense) {
	'use strict';
	var toTag,
		sense,
		id,
		remove,
		removeIcon;
	toTag = document.getElementById('toTag');
	id = semtag.getId(toTag.textContent);
	sense = wordSense.getAttribute('id');
	toTag.setAttribute('id', id);
	toTag.setAttribute('rel', 'http://purl.org/linguistics/gold/hasMeaning');
	toTag.setAttribute('title', wordSense.textContent);
	toTag.setAttribute('resource', sense);
	toTag.setAttribute('about', document.URL + '#' + id);
	toTag.className = 'tagged';
	remove = document.createElement('span');
	remove.className = 'remove';
	removeIcon = document.createElement('img');
	removeIcon.setAttribute('src', '/images/remove.png');
	removeIcon.className = 'removeIcon';
	removeIcon.setAttribute('alt', 'X');
	remove.appendChild(removeIcon);
	toTag.appendChild(remove);
	$('.removeIcon').unbind('click');
	$('.removeIcon').click(function () {
		semtag.removeSense(this);
	});
};
semtag.buildDidYouMeanTable = function (json, tableId) {
	'use strict';
	var didYouMean,
		sensCount = json.senses.length,
		i,
		list,
		el,
		header;
	didYouMean = document.getElementById(tableId) || semtag.buildTag(tableId, 'content-container', {className: "span4"});
	list = document.getElementById('senses') || semtag.buildTag('senses', tableId, {type: "ul"});
	header = document.createElement('h5');
	header.innerText = 'When you say "' + json.word + '" did you mean:';
	didYouMean.innerHTML = "";
	list.innerHTML = "";
	didYouMean.appendChild(header);
	for (i = 0; i < sensCount; i += 1) {
		el = document.createElement('li');
		el.setAttribute('id', json.senses[i].senseid);
		el.className = 'word-sense';
		el.innerText = json.senses[i].explanation;
		list.appendChild(el);
	}
	didYouMean.appendChild(list);
	$('.word-sense').click(function () {
		semtag.wordSenseClicked(this);
		didYouMean.parentNode.removeChild(didYouMean);
	});
};
semtag.sw = function (word) {
	'use strict';
	word = word.replace(/^\s*|\s*$/g, ''); // Removes leading and trailing white space
	word = word.replace(/ /g, '_'); // Replaces inner white space with underscores
	$.getJSON('http://localhost:3000/lex?data={"word":"' + word + '"}', function (data) {
		semtag.buildDidYouMeanTable(data, 'dym');
	});
};
semtag.surround = function (range, className) {
	'use strict';
	var fragment = range.extractContents(),
		tag = document.createElement("span");
	tag.setAttribute("id", className);
	tag.appendChild(fragment);
	range.insertNode(tag);
};
semtag.resetToTag = function (id, callback) {
	'use strict';
	var toRemove,
		parent,
		contents;
	toRemove = document.getElementById(id);
	if (toRemove) {
		contents = toRemove.childNodes[0];
		parent = toRemove.parentNode;
		if (contents) {
			parent.replaceChild(contents, toRemove);
		} else {
			parent.removeChild(toRemove);
		}
	}
	callback();
};
$('#content').mouseup(function () {
	'use strict';
	var range = window.getSelection().getRangeAt(0);
	if (range && range.toString().length > 0) {
		semtag.resetToTag('toTag', function () {
			semtag.surround(range, 'toTag');
			semtag.sw(range.toString());
			document.getSelection().addRange(range);
		});
	}
});
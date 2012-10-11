/*global  $ */
var semtag = semtag || {};
semtag.buildTag = function (id, parentId, type, options) {
	'use strict';
	var el,
		attr,
		attrName;
	if (typeof type === 'object') {
		options = type;
		type = 'div';
	}

	el = document.createElement(type);
	el.setAttribute('id', id);

	for (attr in options) {
		if (options.hasOwnProperty(attr)) {
			attrName = attr === 'className' ? 'class' : attr;
			el.setAttribute(attrName, options[attr]);
		}
	}

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
	removeIcon = semtag.buildTag('', id, 'img', {"src": '/images/remove.png', "alt": 'X', "className": 'removeIcon'});
//	document.createElement('img');
//	removeIcon.setAttribute('src', '/images/remove.png');
//	removeIcon.className = 'removeIcon';
//	removeIcon.setAttribute('alt', 'X');
//	remove.appendChild(removeIcon);
	toTag.appendChild(remove);
	$('.removeIcon').unbind('click');
	$('.removeIcon').click(function () {
		semtag.removeSense(this);
	});
};

semtag.buildInputBox = function () {
	"use strict";
	var input;
	input = document.createElement('input');
	input.setAttribute('id', 'alt-meaning');
	input.setAttribute('type', 'text');
	return input;
};

semtag.buildDidYouMeanTable = function (json, tableId) {
	'use strict';
	var didYouMean,
		sensCount = json.senses.length,
		i,
		list,
		el,
		header,
		input;
	didYouMean = document.getElementById(tableId) || semtag.buildTag(tableId, 'content-container', {className: "span4"});
	list = document.getElementById('senses') || semtag.buildTag('senses', tableId, 'ul');
	didYouMean.innerHTML = "";
	list.innerHTML = "";

	header = semtag.buildTag('dym-head', 'content-container', {});
	input = semtag.buildTag('dym-input', 'content-container', 'input', {type: 'text'});
	header.innerText = 'Pick the term describes "' + json.word + '", describe it with another word, or enter a URL connected to the term';
	didYouMean.appendChild(header);
	didYouMean.appendChild(input);
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
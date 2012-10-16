/*global  $ */
var semtag = semtag || {};
semtag.buildTag = function (parent, type, options) {
	'use strict';
	var el,
		attr,
		attrName;
	if (typeof type === 'object') {
		options = type;
		type = 'div';
	}
	el = document.createElement(type);
	for (attr in options) {
		if (options.hasOwnProperty(attr)) {
			attrName = attr === 'className' ? 'class' : attr;
			el.setAttribute(attrName, options[attr]);
		}
	}
	if (typeof parent === 'string') {
		document.getElementById(parent).appendChild(el);
	} else if (typeof parent === 'object') {
		parent.appendChild(el);
	}
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
semtag.wordSenseClicked = function (wordSense, options) {
	'use strict';
	var toTag,
		sense,
		id,
		title,
		remove,
		removeIcon,
		about,
		content;
	options = options || {};
	toTag = document.getElementById('toTag');
	content = options.text || toTag.textContent;
	id = semtag.getId(content);
	sense = options.wordSense || wordSense.getAttribute('id');
	title = options.title  || wordSense.textContent;
	about = options.about || document.URL + '#' + id;
	toTag.setAttribute('id', id);
	toTag.setAttribute('rel', 'http://purl.org/linguistics/gold/hasMeaning');
	toTag.setAttribute('title', title);
	toTag.setAttribute('resource', sense);
	toTag.setAttribute('about', about);
	toTag.className = 'tagged';
	remove = semtag.buildTag(toTag, 'span', {className: 'remove'});
	removeIcon = semtag.buildTag(remove, 'img', {'id': id, 'src': '/images/remove.png', 'alt': 'X', 'className': 'removeIcon'});
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
		header,
		input,
		word;
	word = document.getElementById('toTag').textContent;
	didYouMean = document.getElementById(tableId) || semtag.buildTag('content-container', {id: tableId, className: "span4"});
	list = document.getElementById('senses') || semtag.buildTag(tableId, 'ul', {id: 'senses'});
	didYouMean.innerHTML = "";
	list.innerHTML = "";
	header = semtag.buildTag(didYouMean, 'h5', {id : 'dym-head'});
	input = semtag.buildTag(didYouMean, 'input', {id: 'dym-input', type: 'text', placeholder: 'Write an URL or term here'});
	$('#dym-input').keypress(function (kp) {
		var inputString,
			// RegExp Pattern lifted from  http://stackoverflow.com/questions/6667029/using-regex-to-match-url-pattern-invalid-quantifier
			URLPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
						'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
						'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
						'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
						'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
						'(\\#[-a-z\\d_]*)?$', 'i'), // fragment locater
			twitterPattern = new RegExp('^@', 'i');
		if (kp.charCode === 13) { // Charcode 13 === Enter keypress
			inputString = input.value;
			if (inputString.search(URLPattern) !== -1) {
				semtag.wordSenseClicked(inputString, {wordSense: inputString, title: "external reference", text: word});
				didYouMean.parentNode.removeChild(didYouMean);
			} else if (inputString.search(twitterPattern) !== -1) {
				semtag.wordSenseClicked(inputString, {wordSense: 'http://twitter.com/' + inputString.substring(1), title: "Twitter handle", text: word});
				didYouMean.parentNode.removeChild(didYouMean);
			} else {
				semtag.sw(input.value);
			}
		}
	});
	header.innerText = 'Pick the term describes "' + json.word + '", describe it with another word, or enter a URL connected to the term';
	for (i = 0; i < sensCount; i += 1) {
		el = semtag.buildTag(list, 'li', {id: json.senses[i].senseid, className: 'word-sense'});
		el.innerText = json.senses[i].explanation;
	}
	didYouMean.appendChild(list);
	$('.word-sense').click(function () {
		semtag.wordSenseClicked(this);
		didYouMean.parentNode.removeChild(didYouMean);
	});
};
semtag.sw = function (word) {
	'use strict';
	word = word.replace(/^\\s*|\\s*$/g, ''); // Removes leading and trailing white space
	word = word.replace(/ /g, '_'); // Replaces inner white space with underscores
	$.getJSON('/lex?data={"word":"' + word + '"}', function (data) {
		semtag.buildDidYouMeanTable(data, 'dym', word);
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
/*jslint browser: true */
/*global  $, console */
var semtag = semtag || {};

semtag.ancestors = function (el, callback, nodes) {
	'use strict';
	nodes = nodes || [];
	if (el.parentNode) {
		nodes.push(el);
		semtag.ancestors(el.parentNode, callback, nodes);
	} else {
		if (typeof callback === 'function') {
			callback(null, nodes);
		}
	}
	return nodes;
};

semtag.hasAncestorWithClass = function (el, className) {
	'use strict';
	var hasAncestor;
	semtag.ancestors(el.parentNode, function (err, ancestors) {
		var i,
			classRegExp = new RegExp('(^|\b)' + className + '(\b|$)');
		if (err) {
			return false;
		}
		for (i = 0; i < ancestors.length; i += 1) {
			if (ancestors[i].className.match(classRegExp)) {
				hasAncestor =  ancestors[i];
			}
		}
	});
	return hasAncestor;
};

semtag.wantedSense = function (sense) {
	'use strict';
	return sense.source !== "DBPedia";
};

semtag.extendTag = function (el, options) {
	'use strict';
	var	i,
		attr,
		data;
	el.id = options.id;
	if (options.classes) {
		for (i = 0; i < options.classes.length || 0; i += 1) {
			el.classList.add(options.classes[i]);
		}
	}
	for (attr in options.attr) {
		if (options.attr.hasOwnProperty(attr)) {
			el.setAttribute(attr, options.attr[attr]);
		}
	}
	for (data in options.data) {
		if (options.data.hasOwnProperty(data)) {
			el.dataset[data] = options.data[data];
		}
	}
	return el;
};

semtag.buildTag = function (type, options) {
	'use strict';
	var el;
	if (typeof type === 'object') {
		options = type;
		type = 'div';
	}
	options = options || {};
	el = semtag.extendTag(document.createElement(type), options);

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
	taggedNode = sense.parentNode;
	taggedNodeParent = taggedNode.parentNode;
	content = document.createTextNode(taggedNode.textContent);
	taggedNodeParent.replaceChild(content, taggedNode);
};

semtag.decideEndpoint = function (source) {
	"use strict";
	if (source === 'schema_org' || source === 'WordNet') {
		return '/wn/best-fit/';
	}
	if (source === 'DBPedia') {
		return 'dbp/best-fit/';
	}
};

semtag.prefixes = {
	'sumo': 'http://www.ontologyportal.org/SUMO.owl# ',
	'schema': 'http://schema.org/'
};

semtag.ensurePrefixes = function () {
	'use strict';
	var prefixes = document.body.getAttribute('prefix') || '',
		prefix;
	for (prefix in semtag.prefixes) {
		if (semtag.prefixes.hasOwnProperty(prefix)) {
			if (prefixes.indexOf(prefix + ':') === -1) {
				prefixes += ' ' + prefix + ': ' + semtag.prefixes[prefix];
			}
		}
	}
	document.body.setAttribute('prefix', prefixes);
};

semtag.addSenses = function (url, callback) {
	'use strict';
	$.getJSON(url, function (json) {
		var senses = [],
			sense = '',
			i,
			sensesString = '';
		semtag.ensurePrefixes();
		if (json.sumo) {
			for (i = 0; i < json.sumo.length; i += 1) {
				if (senses.indexOf(json.sumo[i]) === -1) {
					senses.push(json.sumo[i]);
					sense += " sumo:" + json.sumo[i];
				}
			}
		}
		if (json.schema_dot_org) {
			for (i = 0; i < json.sumo.length; i += 1) {
				if (senses.indexOf(json.schema_dot_org[i]) === -1) {
					senses.push(json.schema_dot_org[i]);
					sense += " schema:" + json.schema_dot_org[i];
				}
			}
		}
		if (json.sumo || json.schema_dot_org) {
			sensesString += senses.join(', ');
		}
		callback(sensesString, sense);
	});
};

semtag.wordSenseClicked = function (wordSense, options) {
	'use strict';
	options = options || {};
	var toTag	= document.getElementById('toTag'),
		content = options.text || toTag.textContent,
		id		= semtag.getId(content),
		about	= options.about || document.URL + '#' + id,
		sense	= options.wordSense || wordSense.getAttribute('id'),
		endpoint = semtag.decideEndpoint(wordSense.dataset.source),
		wnId = sense.substring(sense.lastIndexOf('/') + 1),
		removeIcon;

	semtag.addSenses(endpoint + wnId, function (senses, sense) {
		toTag = semtag.extendTag(toTag,
			{
				'id': id,
				'attr': {
					'title': content + ", meaning: " + senses,
					'typeof': sense,
					'about': about
				},
				classes: ['tagged']
			});
	});
	removeIcon = semtag.buildTag('img', {
		'id': id,
		'attr': {'src': '/images/remove.png',
				'alt': 'X'},
		'classes': ['removeIcon']
	});
	toTag.appendChild(removeIcon);
	$('.removeIcon').unbind('click');
	$('.removeIcon').click(function () {
		semtag.removeSense(this);
	});
	$('#' + id).tooltip();
};

semtag.buildWordSenseList = function (sensList) {
	'use strict';
	var sensCount = sensList.length,
		senses = [],
		list = document.getElementById('senses'),
		i,
		el;
	for (i = 0; i < sensCount; i += 1) {
		if (semtag.wantedSense(sensList[i])) {
			el = semtag.buildTag('li', {
				'id': sensList[i].senseid,
				'data': {
					'source': sensList[i].source
				},
				'classes': ['word-sense']
			});
			el.innerText = sensList[i].explanation;
			senses.push(el.outerHTML);
		}
	}
	list.innerHTML = senses.join(' ');
	return list;
};

semtag.resetDYM = function () {
	'use strict';
	semtag.senses.innerHTML = "";
};

semtag.displayHeader = function (word) {
	'use strict';
	semtag.word.innerText =  word;
	semtag.header.style.display = '';
	semtag.input.style.display = '';
};

semtag.buildDidYouMeanTable = function (json, tableId) {
	'use strict';
	var didYouMean,
		word;
	didYouMean = document.getElementById(tableId);
	word = document.getElementById('toTag').textContent;
	semtag.displayHeader(json.word);
	didYouMean.appendChild(semtag.buildWordSenseList(json.senses));
	$('.word-sense').click(function () {
		semtag.wordSenseClicked(this);
		semtag.header.style.display = 'none';
		semtag.input.style.display = 'none';
		semtag.senses.innerHTML = '';
	});
	$('#sidebar li:nth-child(2) a:first').tab('show'); // Selector for "Meanings pane"
};
semtag.sw = function (term) {
	'use strict';
	term = term.replace(/ /g, '_'); // Replaces inner white space with underscores
	$.getJSON('/lex',
		{
			word: term
		}, function (data) {
			semtag.buildDidYouMeanTable(data, 'dym', term);
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
	var range = window.getSelection().getRangeAt(0),
		text = range.toString().replace(/^\s*|\s*$/g, ''); // Remove leading and trailing whitespace.
	if (!(semtag.hasAncestorWithClass(range.startContainer, 'tagged')
			|| semtag.hasAncestorWithClass(range.endContainer, 'tagged'))) {
		if (range && text.length > 0) {
			if (text.length > 50) {
				$('header .container').append(
					'<div class="alert span6 fade in">'
						+ '<button type="button" class="close" data-dismiss="alert">×</button>'
						+ '<strong>Warning!</strong> Selections should be less than 50 letters.'
						+ '</div>'
				);
			} else {
				semtag.resetToTag('toTag', function () {
					semtag.surround(range, 'toTag');
					semtag.sw(text);
					document.getSelection().addRange(range);
				});
			}
		} else if (range.startContainer === range.endContainer) {
			if (
				(range.commonAncestorContainer.nodeName === 'A'
					&&
					range.commonAncestorContainer.childNodes[0].nodeName === 'IMG'
				)
					||
					range.commonAncestorContainer.nodeName === 'IMG'
			) {
				semtag.resetToTag('toTag', function () {
					semtag.surround(range, 'toTag');
					semtag.sw("Image");
					document.getSelection().addRange(range);
				});
			}
		}
	}
});

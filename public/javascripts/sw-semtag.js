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

semtag.addProperties = function (el) {
	'use strict';
	var properties = el.find('.property'),
		count = properties.length,
		i,
		j,
		parent = el.parent(),
		elementProperties;
	for (i = 0; i < count; i += 1) {
		if (properties[i].value) {
			elementProperties = parent.find('.tagged .property[property="' + properties[i].getAttribute('name')  + '"]');
			for (j = 0; j < elementProperties.length; j += 1) {
				elementProperties[j].setAttribute('content', properties[i].value);
			}
		}
	}
	$('.tagged').popover('hide');
};
/**
* Is called by a tagged term. 
* If property is already set, the function should keep this value as default
* @return {String} inputList, HTML list of possible properties the term can have, and inputs for setting the value.
*/
semtag.buildPropertyInputList = function () {
	'use strict';
	var inputList = '<ul id="properties">',
		self = this,
		i,
		el,
		value,
		count = self.childNodes.length;
	for (i = 0; i < count; i += 1) {
		el = self.childNodes[i];
		if (el.className && el.className.match(/(^|\b)property(\b|$)/)) {
			if (el.dataset.range === 'Text' || el.dataset.range === 'URL') {
				value = el.getAttribute('content') || '';
				inputList += '<li>';
				inputList += '<span class="left">' + el.getAttribute('property') + ': </span>';
				inputList += '<input class="property right" name="'
					+ el.getAttribute('property') + '" type="text" class="right" value="'
					+ value + '" placeholder="' + el.dataset.range + '"/>';
				inputList += '</li>';
			}
		}
	}
	inputList += '<input class="right submit" type="submit" value="Go" /></ul>';
	return inputList;
};

semtag.typeProperties = function (types, callback) {
	'use strict';
	var properties = [],
		type,
		i,
		push = function (data) {
			var type;
			for (type in data) {
				if (data.hasOwnProperty(type)) {
					if (properties.indexOf(data[type]) === -1) {
						if (data[type].indexOf('Text') !== -1 || data[type].indexOf('URL') !== -1) {
							properties.push({'property': 'schema:' + type, 'range': data[type]});
						}
					}
				}
			}
			if (i === types.length) {
				callback(properties);
			}
		};
	types = types.split(' ');
	for (i = 1; i < types.length; i += 1) {
		if (types[i].match(/^schema:/)) {
			type = types[i].substring(7);
			$.getJSON('/properties/' + type, push);
		}
	}
};

semtag.hasAncestorWithClass = function (el, className) {
	'use strict';
	var hasAncestor;
	semtag.ancestors(el.parentNode, function (err, ancestors) {
		var i,
			classRegExp = new RegExp('(^|\b)' + className + '(\b|$)');
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
	if (options.id) {
		el.id = options.id;
	}
	if (options.classes) {
		if (typeof options.classes === 'string') {
			options.classes = [options.classes];
		}
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
		removeIcon,
		jQueryId = '#' + id;

	semtag.addSenses(endpoint + wnId, function (senses, sense) {
		toTag = semtag.extendTag(toTag,
			{
				'id': id,
				'attr': {
					'typeof': sense,
					'about': about
				},
				classes: ['tagged']
			});
		$(jQueryId).tooltip({title: content + ", meaning: " + senses}).popover({placement: 'bottom', html: true, title: '<h4>Properties:</h4>', content: semtag.buildPropertyInputList});
		semtag.typeProperties(sense, function (properties) {
			var i,
				property;
			for (i = 0; i < properties.length; i += 1) {
				property = semtag.buildTag('span', {'classes': 'property', 'attr' : { 'property': properties[i].property}, 'data' : {'range': properties[i].range.join(" ")}});
				toTag.appendChild(property);
			}
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
	var range,
		text;
	if (window.getSelection().rangeCount > 0) {
		range = window.getSelection().getRangeAt(0);
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
	}
});
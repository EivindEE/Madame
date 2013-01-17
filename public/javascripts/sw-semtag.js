/*jslint browser: true */
/*global  $, console */
var semtag = semtag || {};

semtag.clean = function (el, callback) {
	'use strict';
	el = $(el);
	var properties = el.find('.tagged .property'),
		i,
		count = properties.length;
	for (i = 0; i < count; i += 1) {
		if (!properties[i].getAttribute('content') && !properties[i].getAttribute('href')) {
			properties[i].parentElement.removeChild(properties[i]);
		}
	}
	$('.tagged').popover('hide');
	if (callback) {
		callback(el);
	}
};

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

semtag.correctTypeAttribute = function (range) {
	'use strict';

	switch (range) {
	case 'Text':
		return 'content';
	case 'Date':
		return 'content';
	}
	return 'href';
};

semtag.addProperties = function (el, pop) {
	'use strict';
	var properties = el.find('.property'),
		count = properties.length,
		i,
		j,
		parent = pop.prev(),
		elementProperties,
		storeType;

	for (i = 0; i < count; i += 1) {
		if (properties[i].value) {
			elementProperties = parent.find('.property[property="' + properties[i].getAttribute('name')  + '"]');
			for (j = 0; j < elementProperties.length; j += 1) {
				storeType = semtag.correctTypeAttribute(elementProperties[j].dataset.range);

				if (elementProperties[j].dataset.range === 'Text' || properties[i].value !== 'None') {
					elementProperties[j].setAttribute(storeType, properties[i].value);
				} else if (properties[i].value !== 'None') {
					elementProperties[j].setAttribute(storeType, '');
				}
			}
		}
	}
	$('.tagged').popover('hide');
};

/**
*	@param properties, a string with one or more properties
*	@return An array of element id value pairs for elements that have a given property
*/
semtag.getElementsByProperty = function (properties) {
	'use strict';
	var els = document.getElementsByClassName('tagged'),
		count = els.length,
		i,
		j,
		toReturn = [],
		type;
	properties = properties.split(" ");
	for (i = 0; i < count; i += 1) {
		type = els[i].getAttribute('typeof');
		for (j = 0; j < properties.length; j += 1) {
			if (type.match(properties[j])) {
				toReturn.push([els[i].id, els[i].textContent]);
			}
		}
	}
	return toReturn;
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
		id = self.getAttribute('id'),
		i,
		j,
		el,
		value,
		propertyList = self.getElementsByClassName('property'),
		count = propertyList.length,
		properties,
		property,
		notSelf = function (elem) {
			return elem[0] !== id;
		};
	if (count === 0) {
		return '<p>No suitable properties found for this class</p>';
	}
	for (i = 0; i < count; i += 1) {
		el = propertyList[i];
		if (el.className && el.className.match(/(^|\b)property(\b|$)/)) {
			property = el.getAttribute('property').substring(7);
			property = property.charAt(0).toUpperCase() + property.slice(1);
			if (el.dataset.range === 'Text' || el.dataset.range === 'URL') {
				value = el.getAttribute('content') || el.getAttribute('href') || '';
				inputList += '<li>';
				inputList += '<span class="left">' + property + ': </span>';
				inputList += '<input class="property right" name="'
					+ el.getAttribute('property') + '" type="text" value="'
					+ value + '" placeholder="' + el.dataset.range + '"/>';
				inputList += '</li>';
			} else if (el.dataset.range === 'Date') {
				value = el.getAttribute('content') || '';
				inputList += '<li>';
				inputList += '<span class="left">' + property + ': </span>';
				inputList += '<input class="property right" name="';
				inputList += el.getAttribute('property') + '" type="text" placeholder="Format: YYYY-MM-DDTHH:MM" ';
				inputList += 'value="' + value + '" />';
				inputList += '</li>';
			} else {
				value = el.getAttribute('href') || '';
				properties = semtag.getElementsByProperty(el.dataset.range);
				properties = properties.filter(notSelf);
				if (properties.length > 0) {
					inputList += '<li>';
					inputList += '<span class="left">' + property + ': </span>';
					inputList += '<select class="property right" name="' + el.getAttribute('property') + '">';
					inputList += '<option>None</option>';
					for (j = 0; j < properties.length; j += 1) {
						inputList += '<option value="#' + properties[j][0] + '" ';
						if (value === '#' + properties[j][0]) {
							inputList += 'selected';
						}
						inputList += '>' + properties[j][1] + '</option>';
					}
					inputList += '</select>';
					inputList += '</li>';
					inputList += '<li>';
					inputList += '<span class="left"> or write the URL: </span>';
					inputList += '<input class="property right" name="'
						+ el.getAttribute('property') + '" type="text" value="'
						+ value + '" placeholder="URL"/>';
					inputList += '</li>';
				} else {
					inputList += '<li>';
					inputList += '<span class="left">' + property + ': </span>';
					inputList += '<input class="property right" name="'
						+ el.getAttribute('property') + '" type="text" value="'
						+ value + '" placeholder="URL"/>';
					inputList += '</li>';
				}
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
		finished,
		started,
		push = function (data) {
			var type;
			for (type in data) {
				if (data.hasOwnProperty(type)) {
					properties.push({ 'property': 'schema:' + type, 'range': data[type]});
				}
			}
			finished += 1;
			if (finished === started) {
				callback(properties);
			}
		};

	types = types.split(' ');
	finished = 0;
	started = 0;
	for (i = 0; i < types.length; i += 1) {
		if (types[i].match(/^schema:/)) {
			type = types[i].substring(7);
			started += 1;
			$.getJSON('/properties/' + type, push);
		}
	}
};

semtag.hasAncestorWithClass = function (el, className) {
	'use strict';
	var hasAncestor;
	semtag.ancestors(el.parentNode, function (err, ancestors) {
		className = (className instanceof Array ? className.join('|') : className);
		var i,
			classRegExp = new RegExp('(^|\\b)(' + className + ')(\\b|$)');
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
	return true;
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
	if (content.length > 50 || !content.match(/^[a-zA-Z][0-9a-zA-Z]*$/)) {
		content = 'section';
	}
	baseString = 'semtag-' + content.replace(/ /g, '_') + '-';
	id =  baseString + counter;
	while (document.getElementById(id)) {
		counter += 1;
		id =  baseString + counter;
	}
	return id;
};

semtag.removeSense = function (removeImage) {
	'use strict';

	var taggedNode = removeImage.parentNode;
	$('span').tooltip('hide');
	$(taggedNode).children('.property').remove();
	$(taggedNode).children('.removeIcon').remove();
	taggedNode.outerHTML = taggedNode.innerHTML;
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
	'schema': 'http://schema.org/',
	'dbp': 'http://dbpedia.org/resource/'
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
					senses.push('sumo:' + json.sumo[i]);
					sense += " sumo:" + json.sumo[i];
				}
			}
		}
		if (json.schema_dot_org) {
			for (i = 0; i < json.schema_dot_org.length; i += 1) {
				if (senses.indexOf(json.schema_dot_org[i]) === -1) {
					senses.push('schema:' + json.schema_dot_org[i]);
					sense += " schema:" + json.schema_dot_org[i];
				}
			}
		}
		if (json.term) {
			sense = 'dbp:' + json.term;
			sensesString = json.term;
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
		jQueryId = '#' + id,
		tooltipContent = content;

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
		if (content.length > 50) {
			tooltipContent = 'Section';
		}
		$(jQueryId).tooltip({title: tooltipContent + " meaning: " + senses}).popover({placement: 'bottom', html: true, title: '<h4>Properties:</h4>', content: semtag.buildPropertyInputList});
		semtag.typeProperties(sense, function (properties) {
			var i,
				property,
				propertiesAdded = [];
			for (i = 0; i < properties.length; i += 1) {
				if (propertiesAdded.indexOf(properties[i].property) === -1) {
					propertiesAdded.push(properties[i].property);
					property = semtag.buildTag('span', {'classes': 'property', 'attr' : { 'property': properties[i].property}, 'data' : {'range': properties[i].range.join(" ")}});
					toTag.appendChild(property);
				}
			}
		});
	});
	removeIcon = semtag.buildTag('img', {
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
	sensList = sensList.filter(function (el) {

		return el.explanation && (el.senseid.match('noun-[0-9]+$') || el.senseid.match('dbpedia.org'));
	}).sort(function (a, b) {
//		if (a.senseid !== b.senseid) {
		return a.source > b.source;
//		}
	});
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
		if (!(semtag.hasAncestorWithClass(range.startContainer, ['tagged', 'popover'])
				|| semtag.hasAncestorWithClass(range.endContainer, ['tagged', 'popover']))) {
			if (range && text.length > 0) {
				if (text.length > 50) {
					semtag.resetToTag('toTag', function () {
						semtag.surround(range, 'toTag');
						semtag.sw('Topic');
						document.getSelection().addRange(range);
					});
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

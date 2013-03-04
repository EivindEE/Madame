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
			if (type && type.match(properties[j])) {
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
		ranges = '',
		comment = '',
		notSelf = function (elem) {
			return elem[0] !== id;
		};
	if (count === 0) {
		return '<p>No suitable properties found for this class</p>';
	}
	for (i = 0; i < count; i += 1) {
		el = propertyList[i];
		if (el.className && el.className.match(/(^|\b)property(\b|$)/)) {
			ranges = el.dataset.range.split(" ");
			ranges = ranges.length === 1 ? ranges[0] : ranges.slice(0, -1).join(",") + " or " + ranges.slice(-1);
			property = el.getAttribute('property').substring(7);
			property = property.charAt(0).toUpperCase() + property.slice(1);
			comment = el.dataset.comment;
			if (el.dataset.range.match('Text') || el.dataset.range.match('URL') || el.dataset.range.match('Number')) {
				value = el.getAttribute('content') || el.getAttribute('href') || '';
				inputList += '<li>';
				inputList += '<span class="left" title="' + comment + '">' + property + ': </span>';
				inputList += '<input class="property right" name="'
					+ el.getAttribute('property') + '" type="text" value="'
					+ value + '" placeholder="' + el.dataset.range + '"/>';
				inputList += '</li>';
			} else if (el.dataset.range.match('Date')) {
				value = el.getAttribute('content') || '';
				inputList += '<li>';
				inputList += '<span class="left" title="' + comment + '">' + property + ': </span>';
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
					inputList += '<span class="left" title="' + comment + '">' + property + ': </span>';
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
						+ value + '" placeholder="' + ranges + '"/>';
					inputList += '</li>';
				} else {
					inputList += '<li>';
					inputList += '<span class="left" title="' + comment + '">' + property + ': </span>';
					inputList += '<input class="property right" name="'
						+ el.getAttribute('property') + '" type="text" value="'
						+ value + '" placeholder="' + ranges + '"/>';
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
					properties.push({ 'property': 'schema:' + type, 'range': data[type].ranges, 'comment': data[type].comment});
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

semtag.hasAncestorWithId = function (el, id) {
	'use strict';
	var hasAncestor;
	semtag.ancestors(el, function (err, ancestors) {
		id = (id instanceof Array ? id.join('|') : id);
		var i,
			idRegExp = new RegExp('^(' + id + ')$');
		if (err) {
			return false;
		}
		for (i = 0; i < ancestors.length; i += 1) {
			if (ancestors[i].id) {
				if (ancestors[i].id.match(idRegExp)) {
					hasAncestor =  ancestors[i];
					return ancestors[i];
				}
			}
		}
	});
	return hasAncestor;
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
				hasAncestor = ancestors[i];
				return ancestors[i];
			}
		}
	});
	return hasAncestor;
};

semtag.wantedSense = function (sense) {
	'use strict';
	sense = [];
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

semtag.prefixes = semtag.prefixes || {};

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
		var sense,
			ns,
			sensesString;
		for (ns in json.ns) {
			if (json.ns.hasOwnProperty(ns)) {
				semtag.prefixes[ns] = json.ns[ns];
			}
		}
		semtag.ensurePrefixes();
		sense = json.senses.join(" ");
		sensesString = json.senses.map(function (el) {
			var index = el.indexOf(':');
			return el.substring(index + 1);
		}).filter(function (elem, pos, self) {
			return self.indexOf(elem) === pos;
		}).join(", ");
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
					property = semtag.buildTag('span', {'classes': 'property', 'attr' : { 'property': properties[i].property}, 'data' : {'range': properties[i].range.join(" "), "comment": properties[i].comment}});
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
	var sensCount,
		senses = [],
		list = document.getElementById('senses'),
		i,
		el,
		filterFunction,
		hasWordNetMapping = function (list) {
			var i;
			for (i = 0; i < list.length; i += 1) {
				if (list[i].source === 'WordNet') {
					return true;
				}
			}
			return false;
		};
	if (hasWordNetMapping(sensList)) {
		filterFunction = function (el) {
			return el.explanation && el.senseid.match('noun-[0-9]+$');
		};
	} else {
		filterFunction = function (el) {
			return el.explanation;
		};
	}
	sensList = sensList.filter(filterFunction).map(function (el) {
		var index;
		if (el.source === 'WordNet') {
			index = el.word.indexOf(')');
			el.word = el.word.substring(index + 1);
			el.word = semtag.strip(el.word);
			el.word = el.word.charAt(0).toUpperCase() + el.word.substring(1);
		} else if (el.source === 'schema_org') {
			el.word = el.word.charAt(0) + el.word.substring(1).toLowerCase();
		}
		return el;
	}).sort(function (a, b) {
		return a.source > b.source;
	});
	sensCount = sensList.length;
	for (i = 0; i < sensCount; i += 1) {
		if (semtag.wantedSense(sensList[i])) {
			el = semtag.buildTag('li', {
				'id': sensList[i].senseid,
				'data': {
					'source': sensList[i].source
				},
				'classes': ['word-sense']
			});
			el.innerHTML = '<em class="word">' + sensList[i].word + '</em>: ' + sensList[i].explanation;
			senses.push(el.outerHTML);
		}
	}
	list.innerHTML = senses.join(' ');
	return list;
};

semtag.resetDYM = function () {
	'use strict';
	if (semtag.senses) {
		semtag.senses.innerHTML = "";
	}
	if (semtag.input) {
		semtag.input.value = "";
		semtag.input.style.display = "none";
	}
	if (semtag.header) {
		semtag.header.innerHTML = semtag.headerText || '';
	}
};

semtag.displayHeader = function (word) {
	'use strict';
	semtag.header.innerHTML =  'Select the sense which describes <span id="' +  word + '">' + word + '</span>, or write another term which descibes it';
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
		semtag.resetDYM();
		$('#sidebar li:first a:first').tab('show');
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

semtag.strip = function (string) {
	'use strict';
	return string.replace(/^\s*|\s*$/g, ''); // Remove leading and trailing whitespace.
};
semtag.resetToTag = function (id, callback) {
	'use strict';
	var toRemove;
	toRemove = document.getElementById(id);
	if (toRemove) {
		toRemove.outerHTML = toRemove.innerHTML;
	}
	callback();
};
semtag.closestChild = function (node, descendant) {
	"use strict";
	var parent;
	if (descendant.parentElement) {
		parent = descendant.parentElement;
		if (node === parent) {
			return descendant;
		}
		return semtag.closestChild(node, parent);
	}
	return false;
};

semtag.legalRange = function (range) {
	"use strict";
	var newRange = range.cloneRange(),
		child,
		start,
		end;
	while (newRange.toString()[0] === ' ') {
		newRange.setStart(range.startContainer, range.startOffset + 1);
	}
	while (newRange.toString()[newRange.toString().length - 1] === ' ') {
		newRange.setEnd(range.endContainer, range.endOffset - 1);
	}
	if ((range.startContainer === range.endContainer) || (range.startContainer.parentNode === range.endContainer.parentNode)) {
		return newRange;
	}
	child = semtag.closestChild(range.endContainer.parentElement, range.startContainer.parentElement);
	if (child) {
		newRange.setStartBefore(child);
		return newRange;
	}
	child = semtag.closestChild(range.startContainer.parentElement, range.endContainer.parentElement);
	if (child) {
		newRange.setEndAfter(child);
		return newRange;
	}
	start = semtag.closestChild(range.commonAncestorContainer, range.startContainer);
	end = semtag.closestChild(range.commonAncestorContainer, range.endContainer);
	newRange.setStartBefore(start);
	newRange.setEndAfter(end);
	return newRange;
};
$('#content').mouseup(function () {
	'use strict';
	var range,
		text,
		selection = window.getSelection();
	if (selection.rangeCount === 1) {
		range = selection.getRangeAt(0);
		range = semtag.legalRange(range);
		text = semtag.strip(range.toString());
		if (semtag.hasAncestorWithId(range.startContainer, ['content']) &&
				semtag.hasAncestorWithId(range.endContainer, ['content'])) {
			if (!(semtag.hasAncestorWithClass(range.startContainer, ['tagged', 'popover'])
					|| semtag.hasAncestorWithClass(range.endContainer, ['tagged', 'popover']))) {
				document.getSelection().empty();
				if (range && text.length > 0) {
					if (text.length > 50) {
						semtag.resetToTag('toTag', function () {
							semtag.surround(range, 'toTag');
							semtag.sw('Topic');
						});
					} else {
						semtag.resetToTag('toTag', function () {
							semtag.surround(range, 'toTag');
							semtag.sw(text);
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
						});
					}
				}
				document.getSelection().addRange(range);
			}
		}
	}
});

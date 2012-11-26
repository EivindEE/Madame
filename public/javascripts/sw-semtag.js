/*jslint browser: true */
/*global  $, console */
var semtag = semtag || {};

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

semtag.wordSenseClicked = function (wordSense, options) {
	'use strict';
	options = options || {};
	var toTag	= document.getElementById('toTag'),
		title	= options.title  || wordSense.textContent,
		content = options.text || toTag.textContent,
		id		= semtag.getId(content),
		about	= options.about || document.URL + '#' + id,
		sense	= options.wordSense || wordSense.getAttribute('id'),
		endpoint,
		removeIcon,
		wnId = sense.substring(sense.lastIndexOf('/') + 1);
	endpoint = semtag.decideEndpoint(wordSense.dataset.source);

	$.getJSON(endpoint + wnId, function (json) {
		var senses = [],
			i;
		if (json.sumo) {
			for (i = 0; i < json.sumo.length; i += 1) {
				if (senses.indexOf(json.sumo[i]) === -1) {
					sense += " http://www.ontologyportal.org/SUMO.owl#" + json.sumo[i];
					senses.push(json.sumo[i]);
				}
			}
		}
		if (json.schema_dot_org) {
			for (i = 0; i < json.sumo.length; i += 1) {
				if (senses.indexOf(json.schema_dot_org) === -1) {
					sense += " http://schema.org/" + json.schema_dot_org[i];
					senses.push(json.schema_dot_org);
				}
			}
		}
		if (json.sumo || json.schema_dot_org) {
			title = content + ", meaning: ";
			title += senses.join(', ');
		}
		toTag = semtag.extendTag(toTag,
			{
				'id': id,
				'attr': {
					'title': title,
					'typeof': sense,
					'about': about
				},
				classes: ['tagged']
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
		input,
		word;
	didYouMean = document.getElementById(tableId);
	word = document.getElementById('toTag').textContent;
	semtag.displayHeader(json.word);

	$('#dym-input').keypress(function (kp) {
		var inputString,
			// RegExp Pattern lifted from  
			// http://stackoverflow.com/questions/6667029/using-regex-to-match-url-pattern-invalid-quantifier
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
				semtag.resetDYM();
			} else if (inputString.search(twitterPattern) !== -1) {
				semtag.wordSenseClicked(inputString,
					{
						wordSense: 'http://twitter.com/' + inputString.substring(1),
						title: "Twitter handle",
						text: word
					});
				semtag.resetDYM();
			} else {
				semtag.sw(input.value);
			}
		}
	});
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
});
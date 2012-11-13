/*global  $ */
var semtag = semtag || {};
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
	taggedNode = sense.parentNode.parentNode;
	taggedNodeParent = taggedNode.parentNode;
	content = document.createTextNode(taggedNode.textContent);
	taggedNodeParent.replaceChild(content, taggedNode);
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
	if (wordSense.dataset.source === 'schema_org' || wordSense.dataset.source === 'WordNet') {
		endpoint = '/wn/best-fit?q=';
	} else if (wordSense.dataset.source === 'DBPedia') {
		endpoint = 'dbp/best-fit?q=';
	} else {
		console.log(wordSense.dataset.source);
	}
	$.getJSON(endpoint + wnId, function (json) {
		if (json.sumo) {
			sense += " http://www.ontologyportal.org/SUMO.owl#" + json.sumo;
		}
		if (json.schema_dot_org) {
			sense += " http://schema.org/" + json.schema_dot_org;
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
	didYouMean = document.getElementById(tableId);
	if (!didYouMean) {
		didYouMean = semtag.buildTag({id: tableId, classes: ["span4"]});
		document.getElementById('content-container').appendChild(didYouMean);
	}
	list = document.getElementById('senses');
	if (!list) {
		list =  semtag.buildTag('ul', {id: 'senses'});
		document.getElementById(tableId).appendChild(list);
	}
	didYouMean.innerHTML = "";
	list.innerHTML = "";
	header = semtag.buildTag('h5', {id : 'dym-head'});
	input = semtag.buildTag('input', {id: 'dym-input', attr: {type: 'text', placeholder: 'Write an URL or term here'}});
	didYouMean.appendChild(header);
	didYouMean.appendChild(input);
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
		el = semtag.buildTag('li', {
			'id': json.senses[i].senseid,
			data: {
				source: json.senses[i].source
			},
			'classes': ['word-sense']
		});
		list.appendChild(el);
		el.innerText = json.senses[i].explanation;
	}
	didYouMean.appendChild(list);
	$('.word-sense').click(function () {
		semtag.wordSenseClicked(this);
		didYouMean.parentNode.removeChild(didYouMean);
	});
};
semtag.sw = function (term) {
	'use strict';
	term = term.replace(/^\\s*|\\s*$/g, ''); // Removes leading and trailing white space
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
		text = range.toString();
	if (range && text.length > 0) {
		if (text.length > 50) {
			$('header .container').append('<div class="alert span6 fade in"><button type="button" class="close" data-dismiss="alert">×</button><strong>Warning!</strong> Selections should be less than 50 letters.</div>');
		} else {
			semtag.resetToTag('toTag', function () {
				semtag.surround(range, 'toTag');
				semtag.sw(text);
				document.getSelection().addRange(range);
			});
		}
	}
});
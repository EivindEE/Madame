var semtag = semtag || {};

semtag.buildTag = function (id, parentId, options) {
	
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
	var id,
		baseString,
		counter = 1;
	baseString = 'semtag-' + content.replace(/ /g, '_') + '-';
	id =  baseString + counter;
	while (document.getElementById(id)){

		counter += 1;
		id =  baseString + counter;
	}
	return id;
};

semtag.buildDidYouMeanTable = function (json, tableId) {
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
		
		$('.word-sense').click( function () {
			var toTag,
				sense,
				id;

			toTag = document.getElementById('toTag');
			id = semtag.getId(toTag.textContent);
			sense = this.getAttribute('id');
			toTag.setAttribute('id', id);
			toTag.setAttribute('rel', 'http://purl.org/linguistics/gold/hasMeaning');
			toTag.setAttribute('title', this.textContent);
			toTag.setAttribute('resource', sense);
			toTag.setAttribute('about', document.URL + '#' + id);
			toTag.className = 'tagged';
			didYouMean.parentNode.removeChild(didYouMean);
		});
};

semtag.sw = function (word) {
	$.getJSON('http://localhost:3000/lex?data={"word":"' + word + '"}', function (data) {
	semtag.buildDidYouMeanTable(data, 'dym');
	});
};

semtag.surround = function (range, className) {
		fragment = range.extractContents();
		var tag = document.createElement("span");
		tag.setAttribute("id", className);
		tag.appendChild(fragment);
		range.insertNode(tag);
};

semtag.resetToTag = function (id, callback) {
	var toRemove,
		parent,
		child;
	toRemove = document.getElementById(id);
	if ( toRemove ) {
		contents = toRemove.childNodes[0];
		parent = toRemove.parentNode;
		if (contents) {
			parent.replaceChild(contents, toRemove);
		} else {
			parent.removeChild(toRemove);
		}
	}
	callback();
}

$('#content').mouseup(function () {
	var range = window.getSelection().getRangeAt(0);
	if (range && range.toString() !== '') {
		semtag.resetToTag('toTag', function () {	
			semtag.surround(range, 'toTag');
			semtag.sw(range.toString().replace(/ /g, '_'));
			document.getSelection().addRange(range);
		});
	}
});

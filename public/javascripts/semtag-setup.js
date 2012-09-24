/*global document */

var semtag = semtag || {};
semtag.setup = function (container, trigger) {
	"use strict";
	var container,
		tagger;

	
//	console.dir(container);
//	console.dir(container.contentDocument);
//	console.log(container.contentDocument.getElementsByTagName("body"));
	tagger = semtag(container, "trigger");
	container.onmouseup = function () {tagger.extractor.correctSelection();};
	trigger.onmouseup = function () {tagger.extractor.tagSelection();};
};

semtag.setup(document.body, document.getElementById("tag"));

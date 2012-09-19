/*global document */

var semtag = semtag || {};
semtag.setup = function (container) {
	"use strict";
	var container,
		tagger;

	
//	console.dir(container);
//	console.dir(container.contentDocument);
//	console.log(container.contentDocument.getElementsByTagName("body"));
	tagger = semtag(container, "trigger");
	container.onmouseup = function () {tagger.extractor.correctSelection(); console.log("corrected")};
};

semtag.setup(document.body);

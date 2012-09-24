/*global document */

var semtag = semtag || {};
semtag.setup = function (container, trigger, target) {
	"use strict";
	var container,
		extractor;

	
	console.log("constructed");
	extractor = semtag(container, "trigger").extractor;

	container.onmouseup = function () {extractor.correctSelection(); };

	trigger.onmouseup = function () {
		var extracted,
				i,
				length,
				list,
				el;
		target.innerHTML = '';
		extractor.tagSelection();
		extracted = extractor.extract();
		length = extracted.length;
		list = document.createElement("ul");

		target.appendChild(list);
		for (i = 0; i < length; i += 1) {
			el = document.createElement("li");
			el.appendChild(extracted[i]);
			list.appendChild(el);
		}
	};
};

semtag.setup(document.body, document.getElementById("tag"), document.getElementById("extracted"));

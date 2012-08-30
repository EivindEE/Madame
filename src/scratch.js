var selection;
var range;
function replaceSelectedText() {
	"use strict";
    var sel,
		extracted,
		tag;
    if (window.getSelection) {
		selection = sel = window.getSelection();
		range = sel.getRangeAt(0);
		console.log(sel);
		console.log(sel.getRangeAt(0));
		console.log("start===end: " + (range.startContainer === range.endContainer));
		console.log("Common ancestor:");
		console.log(range.commonAncestorContainer);
		extracted = range.extractContents();
		tag = document.createElement("span");
		tag.appendChild(extracted);
		range.insertNode(tag);
	} else {
		alert("please switch to a standards compliant browser");
    }
}

document.getElementById("tag").addEventListener('click', replaceSelectedText, false);
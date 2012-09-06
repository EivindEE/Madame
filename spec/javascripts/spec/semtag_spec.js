/*global describe: false, expect: false, it: false, semtag: false, beforeEach: false, afterEach: false, document: false, body: false*/
describe("SemTag", function () {
	"use strict";
	var extractor;
	beforeEach(function () {
		extractor = semtag("content", "tag").extractor;
	});
	it("should construct with no less than two arguments", function () {
		expect(function () {semtag(); }).toThrow({name : "MissingArgumentsException", message : "Function requires both a valid text and trigger argument"});
		expect(function () {semtag("content"); }).toThrow({name : "MissingArgumentsException", message : "Function requires both a valid text and trigger argument"});
		expect(function () {semtag("content", "tag"); }).not.toThrow({name : "MissingArgumentsException", message : "Function requires both a valid text and trigger argument"});
	});
	describe("it should check if a node is the descendant of another node or if the nodes are equal", function () {
		var body,
			ancestor,
			child,
			descendant,
			textDescendant,
			notDescendant;
		beforeEach(function () {
			body = document.body;
			ancestor = document.createElement("div");
			child = document.createElement("div");
			descendant = document.createElement("div");
			textDescendant = document.createTextNode("TextContent");
			child.appendChild(descendant);
			child.appendChild(textDescendant);
			ancestor.appendChild(child);
			notDescendant = document.createElement("div");
			body.appendChild(ancestor);
			body.appendChild(notDescendant);
		});
		afterEach(function () {
			body.removeChild(ancestor);
			body.removeChild(notDescendant);
		});
		it("should return true if the nodes are the same", function () {
			expect(extractor.ancestorOrSelf(ancestor, ancestor)).toBe(true);
		});
		it("should return false if the node is not a descendant", function () {
			expect(extractor.ancestorOrSelf(ancestor, notDescendant)).toBe(false);
		});
		it("should return true if the node is a child", function () {
			expect(extractor.ancestorOrSelf(ancestor, child)).toBe(true);
		});
		it("should return true if the node is a descendant", function () {
			expect(extractor.ancestorOrSelf(ancestor, descendant)).toBe(true);
		});
		it("should return true if a text node is a descendant", function () {
			expect(extractor.ancestorOrSelf(ancestor, textDescendant)).toBe(true);
		});
	});
	describe("it should provide a minimal legal range", function () {
		var CA,
			CAContent,
			SP,
			SPContent,
			EP,
			EPContent,
			S,
			E,
			range;
		beforeEach(function () {
			CA = document.createElement("div");
			CAContent = document.createTextNode("Common node text");
			SP = document.createElement("span");
			SPContent = document.createTextNode("Start node text");
			EP = document.createElement("p");
			EPContent = document.createTextNode("Start other node text");
			document.body.appendChild(CA);
			range = document.createRange();
		});
		afterEach(function () {
			document.body.removeChild(CA);
		});
		it("should return the same range iff both start and end have the same parent", function () {
			CA.appendChild(CAContent);
			range.setStart(CAContent, 0);
			range.setEnd(CAContent, 5);
			expect(extractor.legalRange(range)).toEqual(range);
			EP.appendChild(EPContent);
			CA.appendChild(EP);
			range.setStart(CAContent, 0);
			range.setEnd(EPContent, 5);
			expect(extractor.legalRange(range)).not.toBe(range);
		});
		it("should extend range to cover the ancestor which is a direct child of the starts container, iff the end is a descendant of the starts container", function () {
			SP.appendChild(SPContent);
			EP.appendChild(EPContent);
			CA.appendChild(SP);
			SP.appendChild(EP);
			range.setStart(SPContent, 3);
			range.setEnd(EPContent, 5);
			expect(extractor.legalRange(range).endContainer).toEqual(SP);
		});
		it("should extend range to cover the ancestor which is a direct child of the end container, iff the start is a descendant of the ends container", function () {
			SP.appendChild(SPContent);
			CA.appendChild(EP);
			EP.appendChild(SP);
			EP.appendChild(EPContent);
			range.setStart(SPContent, 3);
			range.setEnd(EPContent, 5);
			expect(range.startContainer).not.toEqual(EP);
			expect(extractor.legalRange(range).startContainer).toEqual(EP);
		});
		it("should return a range surrounding the ancestor elements, iff they are different children of the common ancestor", function () {
			CA.appendChild(SP);
			CA.appendChild(EP);
			SP.appendChild(SPContent);
			EP.appendChild(EPContent);
			range.setStart(SPContent, 3);
			range.setEnd(EPContent, 5);
			expect(extractor.legalRange(range).startContainer).toBe(CA);
			expect(extractor.legalRange(range).endContainer).toBe(CA);
		});
	});
	describe("it should surround a given range with the tag and class specified", function () {
		var df,
			content,
			notDf,
			tagType = "span",
			className = "tag",
			hasDescendant = function (ancestor, descendant) {
				if (ancestor === descendant) {
					return true;
				}
				if (descendant.parentNode) {
					return hasDescendant(ancestor, descendant.parentNode);
				}
				return false;
			};
		beforeEach(function () {
			df = document.createDocumentFragment();
			content = document.createElement("div");
			content.appendChild(document.createTextNode("Some text"));
			df.appendChild(content);
			this.addMatchers({
				hasDescendant : function (expected) {
					if (this.actual === expected) {
						return false;
					}
					return hasDescendant(this.actual, expected);
				}
			});
		});
		it("should accept a range parameter as it's first parameter", function () {
			expect(extractor.surround(df)).toBeTruthy();
		});
		it("should otherwise throw an exception", function () {
			expect(function () {extractor.surround(notDf); }).toThrow({name: "MissingArgumentsException", message: "Function requires a range object to surround with tags"});
		});
		it("should return an Element with the same text content", function () {
			expect(extractor.surround(df).textContent).toBe(content.textContent);
		});
		it("Element returned should be an ancestor of the content of the input", function () {
			expect(extractor.surround(df)).hasDescendant(content);
		});
		it("Should allow the user to select the surrounding tag type", function () {
			expect(extractor.surround(df, "span").nodeName).toContain("SPAN");
		});
		it("Should allow the user to select the surrounding tag class", function () {
			expect(extractor.surround(df, "span", "semtag").className).toContain("semtag");
		});
	});
});
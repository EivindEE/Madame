/*global describe: false, expect: false, it: false, semtag: false, beforeEach: false, afterEach: false, document: false, body: false, window: false, HTMLElement: false*/
describe("SemTag - Extractor", function () {
	"use strict";
	var extractor,
		container,
		options = {
			nodeName : "SPAN",
			className : "semtag"
		};
	beforeEach(function () {
		container = document.body;
		extractor = semtag(container, options);
	});
	it(" should construct with provided container, should accept options", function () {
		var exception = {name : "MissingArgumentsException", message : "Function requires a valid container argument"};
		expect(function () {semtag(); }).toThrow(exception);
		expect(function () {semtag(container); }).not.toThrow(exception);
		expect(function () {semtag(container, {}); }).not.toThrow(exception);
		expect(function () {semtag(container, {}, "other"); }).not.toThrow(exception);
	});
	it(" should require a HTMLElement as  its first argument", function () {
		var id = document.createElement("span");
		id.setAttribute("id", "idObject");
		document.body.appendChild(id);
		expect(function () {semtag("Not a HTMLNode"); }).toThrow({name : "InvalidTypeException", message : "Container must be a HTMLElement"});
		expect(function () {semtag(document.body); }).not.toThrow({name : "InvalidTypeException", message : "Container must be a HTMLElement"});
		expect(function () {semtag(id); }).not.toThrow({name : "InvalidTypeException", message : "Container must be a HTMLElement"});
		document.body.removeChild(id);
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
		it(" should return true if the nodes are the same", function () {
			expect(extractor.ancestorOrSelf(ancestor, ancestor)).toBe(true);
		});
		it(" should return false if the node is not a descendant", function () {
			expect(extractor.ancestorOrSelf(ancestor, notDescendant)).toBe(false);
		});
		it(" should return true if the node is a child", function () {
			expect(extractor.ancestorOrSelf(ancestor, child)).toBe(true);
		});
		it(" should return true if the node is a descendant", function () {
			expect(extractor.ancestorOrSelf(ancestor, descendant)).toBe(true);
		});
		it(" should return true if a text node is a descendant", function () {
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
		it(" should return the same range iff both start and end have the same parent", function () {
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
		it(" should extend range to cover the ancestor which is a direct child of the starts container, iff the end is a descendant of the starts container", function () {
			SP.appendChild(SPContent);
			EP.appendChild(EPContent);
			CA.appendChild(SP);
			SP.appendChild(EP);
			range.setStart(SPContent, 3);
			range.setEnd(EPContent, 5);
			expect(extractor.legalRange(range).endContainer).toEqual(SP);
		});
		it(" should extend range to cover the ancestor which is a direct child of the end container, iff the start is a descendant of the ends container", function () {
			SP.appendChild(SPContent);
			CA.appendChild(EP);
			EP.appendChild(SP);
			EP.appendChild(EPContent);
			range.setStart(SPContent, 3);
			range.setEnd(EPContent, 5);
			expect(range.startContainer).not.toEqual(EP);
			expect(extractor.legalRange(range).startContainer).toEqual(EP);
		});
		it(" should return a range surrounding the ancestor elements, iff they are different children of the common ancestor", function () {
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
		it(" should accept a range parameter as it's first parameter", function () {
			expect(extractor.surround(df)).toBeTruthy();
		});
		it(" should otherwise throw an exception", function () {
			expect(function () {extractor.surround(notDf); }).toThrow({name: "MissingArgumentsException", message: "Function requires a range object to surround with tags"});
		});
		it(" should return an Element with the same text content", function () {
			expect(extractor.surround(df).textContent).toBe(content.textContent);
		});
		it("Element returned should be an ancestor of the content of the input", function () {
			expect(extractor.surround(df)).hasDescendant(content);
		});
		it(" should allow the user to select the surrounding tag type (via constructor)", function () {
			var options = {nodeName : "SPAN"};
			extractor = semtag(container, options);
			expect(extractor.surround(df).tagName).toContain(options.nodeName);
			options = {nodeName : "DIV"};
			extractor = semtag(container, options);
			expect(extractor.surround(df).tagName).toContain(options.nodeName);
		});
		it(" should allow the user to select the surrounding tag class (via constructor)", function () {
			var options = {className : "semtag"};
			extractor = semtag(container, options);
			expect(extractor.surround(df).className).toContain(options.className);
		});
	});
	describe("it should extract the selected ranges", function () {
		var tags = [],
			notTags = [],
			numberOfTags = 4,
			numberNotTags = 4,
			element,
			i,
			totalElements = numberOfTags + numberNotTags,
			contains = function (item, list) {
				var i;
				for (i = 0; i < list.length; i += 1) {
					if (item === list[i]) {
						return true;
					}
				}
				return false;
			};
		beforeEach(function () {
			for (i = 0; i < numberOfTags; i += 1) {
				element = document.createElement("span");
				element.setAttribute("class", "semtag");
				document.body.appendChild(element);
				tags.push(element);
			}
			for (i = 0; i < numberOfTags; i += 1) {
				element = document.createElement("span");
				element.setAttribute("class", "not-semtag");
				document.body.appendChild(element);
				notTags.push(element);
			}
			this.addMatchers({
				toContainAll : function (expected) {
					var i;
					for (i = 0; i < expected.length; i += 1) {
						if (!contains(expected[i], this.actual)) {
							return false;
						}
					}
					return true;
				},
				toContainNone : function (expected) {
					var i;
					for (i = 0; i < expected.length; i += 1) {
						if (contains(expected[i], this.actual)) {
							return false;
						}
					}
					return true;
				}
			});
		});
		afterEach(function () {
			for (i = 0; i < tags.length; i += 1) {
				document.body.removeChild(tags[i]);
			}
			tags = [];
			for (i = 0; i < notTags.length; i += 1) {
				document.body.removeChild(notTags[i]);
			}
			notTags = [];
		});
		it(" should return an array with the correct number of elements elements", function () {
			expect(extractor.extract().length).toBe(numberOfTags);
		});
		it(" should include all the tagged elements", function () {
			expect(extractor.extract()).toContainAll(tags);
		});
		it(" should include none of the untagged elements", function () {
			expect(extractor.extract()).toContainNone(notTags);
		});
	});
	describe(" should tag a selection of document", function () {
		var pNode,
			firstTextNode,
			textNode,
			lastTextNode,
			selection,
			range,
			parent,
			outsideText;
		beforeEach(function () {
			selection = window.getSelection();
			range = document.createRange();
			parent = document.createElement("div");
			parent.setAttribute("id", "container");
			pNode = document.createElement("p");
			pNode.setAttribute("id", "paragraph");
			firstTextNode = document.createTextNode("first text node");
			textNode = document.createTextNode("middle text node");
			lastTextNode = document.createTextNode("last text node");
			outsideText = document.createTextNode("outside text node");
			pNode.appendChild(textNode);
			parent.appendChild(firstTextNode);
			parent.appendChild(pNode);
			parent.appendChild(lastTextNode);
			document.body.appendChild(parent);
			document.body.appendChild(outsideText);
			this.addMatchers({
				toBeInstanceOf: function (type) {
					return this.actual instanceof type;
				}
			});
		});
		afterEach(function () {
			document.body.removeChild(parent);
			document.body.removeChild(outsideText);
			selection.removeAllRanges();
		});
		it(" should return the new semtag Element", function () {
			range.setStart(firstTextNode, 0);
			range.setEnd(firstTextNode, 1);
			selection.addRange(range);
			expect(extractor.tagSelection()).toBeInstanceOf(HTMLElement);
			expect(extractor.tagSelection().className).toBe(options.className);
			expect(extractor.tagSelection().nodeName).toBe(options.nodeName);
		});
		it(" should be a direct parent if selection is within a single text node", function () {
			var contents;
			range.setStart(textNode, 0);
			range.setEnd(textNode, 5);
			contents = range.cloneContents();
			selection.addRange(range);
			expect(extractor.tagSelection().childNodes[0].textContent).toEqual(contents.childNodes[0].textContent);
		});
		it(" should be a direct parent if selection is a single node", function () {
			var contents;
			range.setStartBefore(pNode);
			range.setEndAfter(pNode);
			contents = range.cloneContents();
			selection.addRange(range);
			expect(extractor.tagSelection().childNodes[1].getAttribute("id")).toEqual(contents.childNodes[0].getAttribute("id"));
		});
		it(" should throw an exception if selection is outside of container", function () {
			container = document.getElementById(parent.getAttribute("id"));
			extractor = semtag(container);
			range.setStart(outsideText, 1);
			range.setEnd(outsideText, 5);
			selection.addRange(range);
			expect(function () {extractor.tagSelection(); }).toThrow({name: "InvalidSelectionException", message: "Selection is outside of the scope of the semtag container"});
			selection.removeAllRanges();
			range.setStart(outsideText, 1);
			range.setEndAfter(parent);
			selection.addRange(range);
			expect(function () {extractor.tagSelection(); }).toThrow({name: "InvalidSelectionException", message: "Selection is outside of the scope of the semtag container"});
		});
		it(" should tag the selected section of the document", function () {
			expect(container.getElementsByClassName("semtag").length).toBe(0);
			range.setStartBefore(pNode);
			range.setEndAfter(pNode);
			selection.addRange(range);
			extractor.tagSelection();
			expect(container.getElementsByClassName("semtag").length).toBe(1);
		});
	});
	describe(" should correct the selected range iff it's not a legal range and iff the selection is within the container", function () {
		var beforeContainer,
			beforeContainerText,
			container,
			beforePNodeText,
			pNode,
			pNodeText,
			innerPNode,
			innerPNodeText,
			pNodeTextLast,
			afterPNodeText,
			afterContainer,
			afterContainerText,
			partialyContained,
			fullyContained,
			selection,
			range;
		beforeEach(function () {
			beforeContainer = document.createElement("DIV");
			beforeContainerText = document.createTextNode("before container text");
			container = document.createElement("DIV");
			beforePNodeText = document.createTextNode("before pNode text");
			pNode = document.createElement("P");
			pNodeText = document.createTextNode("paragraph text node");
			innerPNode = document.createElement("P");
			innerPNodeText = document.createTextNode("inner paragraph text node");
			pNodeTextLast = document.createTextNode("last paragraph text node");
			afterPNodeText = document.createTextNode("after paragraph text node");
			afterContainer = document.createElement("DIV");
			afterContainerText = document.createTextNode("before container text");
			partialyContained = true;
			fullyContained = false;
			beforeContainer.appendChild(beforeContainerText);
			container.appendChild(beforePNodeText);
			pNode.appendChild(pNodeText);
			innerPNode.appendChild(innerPNodeText);
			pNode.appendChild(innerPNode);
			pNode.appendChild(pNodeTextLast);
			container.appendChild(pNode);
			container.appendChild(afterPNodeText);
			afterContainer.appendChild(afterContainerText);
			document.body.appendChild(beforeContainer);
			document.body.appendChild(container);
			document.body.appendChild(afterContainer);
			extractor = semtag(container);
			selection = window.getSelection();
			range = document.createRange();
			
			this.addMatchers({
				commonParentAncestor: function (expected) {
					var start = this.actual.startContainer.nodeName !== "#text" ? 
								this.actual.startContainer : this.actual.startContainer.parentNode ,
						end = this.actual.endContainer.nodeName !== "#text" ? 
								 this.actual.endContainer : this.actual.endContainer.parentNode;
					this.message = function () {
						var message = "";
						if (start !== expected) {
							message = "Start was in:" + start;
						}
						if (end !== expected) {
							message += " End was in:" + end;
						}
						return message + ", should be :" + expected;
					};
					
					return start === expected && end === expected;
				}
			});
		});
		afterEach(function () {
			document.body.removeChild(beforeContainer);
			document.body.removeChild(container);
			document.body.removeChild(afterContainer);
			selection.removeAllRanges();
		});
		it(" should throw an exception if the start ( anchor) of the selection is outside of the container", function () {
			range.setStart(beforeContainerText, 0);
			range.setEnd(beforePNodeText, 3);
			selection.addRange(range);
			expect(function () {extractor.correctSelection(); }).toThrow({name: "InvalidSelectionException", message: "Selection must be fully within the container"});
		});
		it(" should not throw an exception if both the start and end ( anchor and focus) of the selection are within the container", function () {
			range.setStart(beforePNodeText, 0);
			range.setEnd(afterPNodeText, 5);
			selection.addRange(range);
			expect(function () {extractor.correctSelection(); }).not.toThrow({name: "InvalidSelectionException", message: "Selection must be fully within the container"});
		});
		it(" should throw an exception if the end ( focus) of the selection is outside of the container", function () {
			range.setStart(beforePNodeText, 3);
			range.setEnd(afterContainerText, 2);
			selection.addRange(range);
			expect(function () {extractor.correctSelection(); }).toThrow({name: "InvalidSelectionException", message: "Selection must be fully within the container"});
		});
		
		it(" should not modify and return the range if the start and end of the selection is in the same node", function () {
			range.setStart(beforePNodeText, 0);
			range.setEnd(beforePNodeText, 2);
			selection.addRange(range);
			expect(extractor.correctSelection()).toEqual(range);
			expect(selection.getRangeAt(0)).toEqual(range);
		});
		
		it(" should leave range the same and return if the start and end are children of the same node", function () {
			range.setStart(beforePNodeText, 0);
			range.setEnd(afterPNodeText, 0);
			selection.addRange(range);
			expect(extractor.correctSelection()).toEqual(range);
			expect(selection.getRangeAt(0)).toEqual(range);
		});
		
		it(" should change the range, if the start and end are not children of the same node", function () {
			range.setStart(beforePNodeText, 0);
			range.setEnd(pNodeText, 2);
			selection.addRange(range);
			expect(selection.containsNode(pNode, partialyContained)).toBeTruthy();
			expect(selection.containsNode(pNode, fullyContained)).toBeFalsy();
			expect(extractor.correctSelection()).commonParentAncestor(container);
		});
		
		it(" should change the range, if the start is in a child of ends parent", function () {
			range.setStart(innerPNodeText, 0);
			range.setEnd(pNodeTextLast, 2);
			selection.addRange(range);
			expect(extractor.correctSelection()).commonParentAncestor(pNode);
		});
		
		it(" should change the range, if the end is in a child of starts parent", function () {
			range.setStart(pNodeText, 0);
			range.setEnd(innerPNodeText, 2);
			selection.addRange(range);
			expect(extractor.correctSelection()).commonParentAncestor(pNode);
		});
	});
});
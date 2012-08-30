SemTag [![Build Status](https://secure.travis-ci.org/EivindEE/SemTag.png)](http://travis-ci.org/EivindEE/SemTag)
=============================
# Purpose of SemTagExtractor

SemTagExtractor should take a pice of text, let the user mark the parts that have an important semantic meaning,
and extract these parts for further processing.

## Initial specifications for semtag.js:
* semtag should be constructed by giving the id of the element containing the text, and the id of the trigger.
* When the trigger is pressed the selected text should tagged for extraction

The simple case is when both the start and end of the selected text is within the same node
in the DOM. In these cases the item can be tagged simply by appending and prepending tags.
The more difficult case is when the start and end nodes are different. 
In this case the selection has to be expanded in such a way as to maintain the well formed-ness of the DOM.

There are several way one could solve this problem.
One way would be to simply append the tag to the first common ancestor for the two points.
A way which may be better would be to track the nodes up to their common ancestor and see 
if they are the same node. If they are not, then surround the nodes with a tag.



## Proposed functions
All functions are assumed to be run in the browser, with access to the global document and window objects.

* Find correct scope
	```
	@param range: Range, the Range object containing the selected text
	@return Range, a range object containing the range which should be tagged
	```

* Surround range with tags

	```
	@param range: Range, the range to be surrounded with tags
	@param string: tag, the name of the tag to be created(default: span) 
	@param string: className, the name of the class the tag should be given
	@return a map containing a DocumentFragment object containing the tagged text
	```

* Ancestor or self (to make sure we only tag the content) 

	```
	@param descendant: Object with ancestor, the object to check if has ancestor (must have a parentNode attribute!)
	@param ancestor: HTMLElement, the element to check if is ancestor
	@return true iff descendant is a descendant of ancestor
	```

	
	
SemTag
============================

TODO
=====
Properties must be declared differently
	Text: content
	URL: href
	etc...

Add properties
e.g.
```
	<span typeof='schema:Thing'>
		<span property="schema:description" content="some thing">&nbsp;</span>
	</span>
```


# Homepage
You can view this projects homepage on [eelseth.github.com/SemTag](http://eivindee.github.com/SemTag)
# Tests
To run the tests for this project, open `/spec/SpecRunner.html`.
The tests will then be run in your browser. 
This package will be tested on Safari, Chrome and FireFox as these are the ones I have access to.
Support for IE might be added at a later time.

# Dependencies
This project runs on [node.js](http://nodejs.org), which needs to be installed to use the artefact.
Most of the dependencies are included in the `package.json` file and can be installed by running `npm install` in root project.
For dev there is also a dependency for grunt.js which can be installed by running `[sudo] npm install -g grunt`.
To make sure the web page is running the latest build, run grunt before opening the page.

# Purpose of SemTagExtractor

SemTagExtractor should take a pice of text, let the user mark the parts that have an important semantic meaning,
and extract these parts for further processing.

Special care needs to be taken with the ranges of the selection. 
Since we need to insert the meta data into tags we can't just use the user range without some checks.
Consider the case:

`<p>`some text <span style="background: lightblue;"> in a p`</p> <p>` pluss some </span>  other text `</p>`

If we simply inserted a tag we would get invalid HTML:

`<p>`some text `<tag>` in a p`</p> <p>` pluss some `</tag>`  other text `</p>`

To get a well formed HTML document we need to either close and open the HTML tags

`<p>`some text `</p><tag><p>` in a p`</p> <p>` pluss some ``</p></tag><p>`  other text `</p>`

which would change the meaning and probably the layout of the document or we could expand the range of the selection:

`<tag><p>`some text in a p`</p>` `<p>` pluss some   other text `</p></tag>`

extending the range in this way should conserve the meaning of the original markup and still have the selected text in scope.


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

* Find a legal range
	```
	@param range: Range, the Range object containing the selected text
	@return Range, a range object containing the range which should be tagged
	```

* Surround DocumentFragment with tags

	```
	@param range: Range, the range to be surrounded with tags
	@param string: tag, the name of the tag to be created(default: span) 
	@param string: className, the name of the class the tag should be given(default: semtag)
	@return a Element object containing the tagged text
	```

* Ancestor or self (to make sure we only tag the content) 

	```
	@param descendant: Object with ancestor, the object to check if has ancestor (must have a parentNode attribute!)
	@param ancestor: HTMLElement, the element to check if is ancestor
	@return true iff descendant is a descendant of ancestor
	```
	
* Extract tags
	```
	@return a list containing the selected ranges in the container
	```

* Surround the current selection with tags
	```
	@sideEffect selection surrounded with element
	@return the newly created Element
	```

* Correct selected range if not a legal range
	```
	@sideEffect current selection changed to legal selection
	```
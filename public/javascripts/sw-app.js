/*jslint browser: true */
/*global  $, console */

var semtag = semtag || {};
$('#sidebar a').click(function (e) {
	'use strict';
	e.preventDefault();
	$(this).tab('show');
});
$('#sidebar a:first').tab('show');
(function () {
	'use strict';
	var semtag = window.semtag || {};
	semtag.header = document.getElementById('dym-header');
	semtag.header.style.display = "none";
	semtag.word = document.getElementById('word');
	semtag.input = document.getElementById('dym-input');
	semtag.input.style.display = "none";
	semtag.dym = document.getElementById('dym-input');
	semtag.senses = document.getElementById('senses');
	semtag.dom = semtag.dom || {};
}());

semtag.exportPage = function () {
	'use strict';
	var html =  document.getElementById('content').innerHTML,
		head = semtag.dom.head || '';
	$.post('/export',
		{
			'q' : html,
			'head': head,
			'URI': semtag.dom.URI
		}, function (id) {
			id = id.replace(/"/g, '');
			$('#link').html('You can view the extracted page on <a href="/load?q=' + id + '">' + document.URL + 'load?q=' + id + '</a>');
		});
};

$('#export-btn').click(function () {
	'use strict';
	if (semtag.clean) {
		semtag.clean(semtag.exportPage);
	} else {
		semtag.exportPage();
	}
});

$('#dym-input').keypress(function (kp) {
	'use strict';
	var inputString,
		// RegExp Pattern lifted from  
		// http://stackoverflow.com/questions/6667029/using-regex-to-match-url-pattern-invalid-quantifier
		URLPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
					'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
					'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
					'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
					'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
					'(\\#[-a-z\\d_]*)?$', 'i'), // fragment locater
		twitterPattern = new RegExp('^@', 'i'),
		word = document.getElementById('toTag').textContent;
	if (kp.charCode === 13) { // Charcode 13 === Enter keypress
		inputString = semtag.input.value;
		if (inputString.search(URLPattern) !== -1) {
			semtag.wordSenseClicked(inputString, {'wordSense': inputString, 'title': 'external reference', 'text': word});
			semtag.resetDYM();
		} else if (inputString.search(twitterPattern) !== -1) {
			semtag.wordSenseClicked(inputString,
				{
					'wordSense': 'http://twitter.com/' + inputString.substring(1),
					'title': "Twitter handle",
					'text': word
				});
			semtag.resetDYM();
		} else {
			semtag.sw(inputString);
		}
	}
});
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
	semtag.headerText = 'Highlight a word in the panel to the right to select a word';
	semtag.header.innerHTML = semtag.headerText;
	semtag.word = document.getElementById('word');
	semtag.input = document.getElementById('dym-input');
	semtag.input.style.display = "none";
	semtag.dym = document.getElementById('dym-input');
	semtag.senses = document.getElementById('senses');
	semtag.dom = semtag.dom || {};
}());

semtag.exportPage = function (head, html) {
	'use strict';


	$.post('/export',
		{
			'q' : html[0].innerHTML,
			'head': head,
			'URI': semtag.dom.URI,
			'prefixes': document.body.getAttribute('prefix')
		}, function (id) {

			id = id.replace(/"/g, '');
			$('#link').html('You can view the extracted page on <a href="/load?q=' + id + '">' + document.URL + 'load?q=' + id + '</a>');
		});
};

$('#export-btn').click(function () {
	'use strict';
	if ($('#google-id').val()) {
		$('#content').append('<a rel="author" href="' + $('#google-id').val() + '"></a>');
	}
	var head = semtag.dom.head || '',
		html = document.getElementById('content').cloneNode(true);
	if (semtag.clean) {
		semtag.clean(html, function (cleanHTML) {
			semtag.exportPage(head, cleanHTML);
		});
	} else {
		semtag.exportPage(head, html);
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

$(document).keyup(function (e) {
	'use strict';
	if (e.keyCode === 27) {
		$('.tagged').popover('hide');
	}
});
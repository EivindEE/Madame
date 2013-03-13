/*jslint browser: true */
/*global  $, console */

var madame = madame || {};

madame.exportPage = function (head, html) {
	'use strict';
	$.post('/export',
		{
			'q' : html[0].innerHTML,
			'head': head,
			'URI': madame.dom.URI,
			'prefixes': document.body.getAttribute('prefix')
		}, function (id) {

			id = id.replace(/"/g, '');
			$('#link').html('You can view the extracted page on <a href="/load?q=' + id + '">' + document.URL + 'load?q=' + id + '</a>');
		});
};

(function (contentPane) {
	'use strict';
	// Convenience variables
	madame.header = document.getElementById('dym-header');
	madame.headerText = 'Highlight a word in the panel to the right to select a word';
	madame.header.innerHTML = madame.headerText;
	madame.word = document.getElementById('word');
	madame.input = document.getElementById('dym-input');
	madame.input.style.display = "none";
	madame.dym = document.getElementById('dym-input');
	madame.senses = document.getElementById('senses');
	madame.dom = madame.dom || {};

	// Sets up tabbed menu, defaults to the first item
	$('#sidebar a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	});
	$('#sidebar a:first').tab('show');

	// Sets up querying for a word when it's been selected
	$('#' + contentPane).mouseup(function () {
		var range,
			text,
			selection = window.getSelection();
		if (selection.rangeCount === 1) {
			range = selection.getRangeAt(0);
			range = madame.legalRange(range);
			text = madame.strip(range.toString());
			if (madame.hasAncestorWithId(range.startContainer, [contentPane]) &&
					madame.hasAncestorWithId(range.endContainer, [contentPane])) {
				if (!(madame.hasAncestorWithClass(range.startContainer, ['tagged', 'popover'])
						|| madame.hasAncestorWithClass(range.endContainer, ['tagged', 'popover']))) {
					document.getSelection().empty();
					if (range && text.length > 0) {
						if (text.length > 50) {
							madame.resetToTag('toTag', function () {
								madame.surround(range, 'toTag');
								madame.sw('Topic');
							});
						} else {
							madame.resetToTag('toTag', function () {
								madame.surround(range, 'toTag');
								madame.sw(text);
							});
						}
					} else if (range.startContainer === range.endContainer) {
						if (
							(
								range.commonAncestorContainer.nodeName === 'A'
								&&
								range.commonAncestorContainer.childNodes[0].nodeName === 'IMG'
							)
								||
								range.commonAncestorContainer.nodeName === 'IMG'
						) {
							madame.resetToTag('toTag', function () {
								madame.surround(range, 'toTag');
								madame.sw("Image");
							});
						}
					}
					document.getSelection().addRange(range);
				}
			}
		}
	});
	// Redo search on enter when own keyword has been selected
	$('#dym-input').keypress(function (kp) {
		if (kp.charCode === 13) { // Charcode 13 === Enter keypress
			madame.sw(madame.input.value);
		}
	});

	// Set up export button, add google id if provided
	$('#export-btn').click(function () {
		if ($('#google-id').val()) {
			$('#' + contentPane).append('<a rel="author" href="' + $('#google-id').val() + '"></a>');
		}
		var head = madame.dom.head || '',
			html = document.getElementById(contentPane).cloneNode(true);
		if (madame.clean) {
			madame.clean(html, function (cleanHTML) {
				madame.exportPage(head, cleanHTML);
			});
		} else {
			madame.exportPage(head, html);
		}
	});

	// Set up  hide popover when esc is pressed
	$(document).keyup(function (e) {
		if (e.keyCode === 27) {
			$('.tagged').popover('hide');
		}
	});

	var getPage = function () {
		document.getElementById(contentPane).innerHTML = '<div class="span6"><h4>Loading</h4></div>';
		var url = $('#url').val();
		madame.get(url, function (error, dom) {
			if (error) {
				document.getElementById(contentPane).innerHTML = '<div class="span6"><h4>No such page found</h4></div>';
			} else {
				madame.dom = {};
				madame.dom.URI = dom.URI || '';
				madame.dom.head = dom.head || '';
				document.getElementById(contentPane).innerHTML = dom.body;
				$(document.getElementById(contentPane)).click(function (e) {
					e.preventDefault();
				});
			}

		});
	};
	$('#get').click(getPage);
	$('#url').keypress(function (e) {
		if (e.keyCode === 13) {
			getPage();
		}
	});
	madame.get = function (url, callback) {
		var data;
		$.getJSON('/proxy?q=' +  url, function (response) {
			data = response;
		}).success(function () {
			callback(null, data);
		}).error(function (data) {
			callback(data);
		});
	};
}('content'));


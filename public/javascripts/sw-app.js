/*jslint browser: true */
/*global  $, console */

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
}());


$('#export-btn').click(function () {
	'use strict';
	var html =  document.getElementById('content').innerHTML;
	console.log(html);
	$.post('/export',
		{
			'q' : html
		}, function (id) {
			id = id.replace(/"/g, '');
			$('#link').html('You can view the extracted page on <a href="/load?q=' + id + '">' + document.URL + 'load?q=' + id + '</a>');
		});
});
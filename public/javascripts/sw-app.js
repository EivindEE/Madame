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
	semtag.input = document.getElementById('dym-input');
	semtag.input.style.display = "none";
	semtag.dym = document.getElementById('dym-input');
	semtag.senses = document.getElementById('senses');
}());

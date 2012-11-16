/*jslint browser: true */
/*global  $, console */

$('#sidebar a').click(function (e) {
	'use strict';
	e.preventDefault();
	$(this).tab('show');
});
$('#sidebar a:first').tab('show');
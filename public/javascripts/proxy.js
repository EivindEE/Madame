/*jslint browser:true */
/*globals $, console */
var proxy = proxy || {};
proxy.get = function (url, callback) {
	"use strict";
	var data;
	$.get('/proxy?q=' +  url, function (response) {
		data = response;
	}).success(function () {
		callback(null, data);
	}).error(function (data) {
		callback(data);
	});
};

$('#get').click(function () {
	'use strict';
	var url = $('#url').val();
	proxy.get(url, function (error, html) {
		if (error) {
			document.getElementById('content').innerHTML = '<div class="span6"><h4>No such page found</h4></div>';
		} else {
			document.getElementById('content').innerHTML = html;
		}

	});
});

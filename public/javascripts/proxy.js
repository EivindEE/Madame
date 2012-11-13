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
		document.getElementById('content').innerHTML = html;
	});
});
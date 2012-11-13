/*jslint browser:true */
/*globals $, console */
var proxy = proxy || {};
proxy.get = function (url) {
	"use strict";
	var data;
	$.get('/proxy?q=' +  url, function (response) {
		data = response;
		document.getElementById('content').innerHTML = data;
	}).complete(function () {
		console.log('complete');
	}).error(function (data) {
		console.log(data);
	});
};
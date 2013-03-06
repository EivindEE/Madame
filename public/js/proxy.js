/*jslint browser:true */
/*globals $, console */
var proxy = proxy || {};
var madame = madame || {};
proxy.get = function (url, callback) {
	"use strict";
	var data;
	$.getJSON('/proxy?q=' +  url, function (response) {
		data = response;
	}).success(function () {
		callback(null, data);
	}).error(function (data) {
		callback(data);
	});
};
(function () {
	'use strict';
	var getPage = function () {
		document.getElementById('content').innerHTML = '<div class="span6"><h4>Loading</h4></div>';
		var url = $('#url').val();
		proxy.get(url, function (error, dom) {
			if (error) {
				document.getElementById('content').innerHTML = '<div class="span6"><h4>No such page found</h4></div>';
			} else {
				madame.dom = {};
				madame.dom.URI = dom.URI || '';
				madame.dom.head = dom.head || '';
				document.getElementById('content').innerHTML = dom.body;
				$(document.getElementById('content')).click(function (e) {
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
}());
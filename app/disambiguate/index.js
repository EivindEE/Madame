/*jslint node: true, regexp: true */
'use strict';
var http = require("http"),
	url = require('url'),
	saneString = function (searchString, callback) {
		if (searchString.length > 60) {
			callback(new Error('Search string <' + searchString + '> was to long'));
		} else {
			callback(null, searchString);
		}
	},
	findLexitagTerms = function (searchString, callback) {
		var body = '',
			url = 'http://lexitags.dyndns.org:8080/server/lexitags2/Semtags?data={"word": "',
			queryEnd = '"}';
		saneString(searchString, function (error, saneSearchString) {
			if (error) {
				console.log(error);
				callback(JSON.parse('{"senses": []}'));
			} else {
				http.get(url + saneSearchString + queryEnd,
					function (response) {
						if (response.statusCode !== 200) {
							callback({});
						} else {
							response.on('data', function (chunk) {
								body += chunk;
							});
							response.on('end', function () {
								callback(JSON.parse(body));
							}).on('error', function () {
								callback({});
							});
						}
					});
			}
		});
	};

/**
*	Finds a list of possible definitions of the term
*	@param {String} term: The term to define
*	@param {Function} callback($error, $definitions):
*	The function that is called when the definitions have been found
*	$error {Object}: An error object with the error encountered, or null
*	$definitions{Object}: An object of the form:
*	{
*		word {String}: The word to define
*		senses {Array}: An array containing the possible definitions. A definition is in the form
*		{
*			senseid {String}: A unique URL for the sense
*			explanation {String}: A short text explaining the definition
*		}
*	}
*/
exports.term = function (term, callback) {
	findLexitagTerms(term, function (json) {
		callback(null, json);
	});
};
/*jslint node: true, regexp: true */
'use strict';
var http = require("http"),
	url = require('url'),
	saneString,
	defaultResponse,
	findLexitagTerms;

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

findLexitagTerms =
	function (searchString, callback) {
		var body = '',
			url = 'http://lexitags.dyndns.org/server/lexitags2/Semtags?data={"word": "',
			queryEnd = '"}';
		saneString(searchString, function (error, saneSearchString) {
			if (error) {
				console.log(error);
				callback(JSON.parse('{"senses": []}'));
			} else {
				var request = http.get(url + saneSearchString + queryEnd,
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
								callback(defaultResponse);
							});
						}
					}).on('error',
					function () {
						callback({});
					});
				request.setTimeout(5000,
					function () {
						callback(defaultResponse);
					});
			}
		});
	};

defaultResponse = {
	'default': true,
	senses: [
		{
			'senseid': '/synset-person-noun-1',
			'explanation': 'A person (alive, dead, undead, or fictional).',
			'source': 'schema_org',
			'word': 'Person'
		},
		{
			'senseid': '/synset-place-noun-2',
			'explanation': 'Entities that have a somewhat fixed, physical extension',
			'source': 'schema_org',
			'word': 'Place'
		},
		{
			'senseid': '/synset-artefact-noun-1',
			'explanation': 'A product is anything that is made available for sale—for example, a pair of shoes, a concert ticket, or a car. Commodity services, like haircuts, can also be represented using this type',
			'source': 'schema_org',
			'word': 'Product'
		},

		{
			'senseid': '/synset-organization-noun-1',
			'explanation': 'An organization such as a school, NGO, corporation, club, etc.',
			'source': 'schema_org',
			'word': 'Organization'
		},
		{
			'senseid': '/synset-abstraction-noun-6',
			'explanation': 'A utility class that serves as the umbrella for a number of \'intangible\' things such as quantities, structured values, etc.',
			'source': 'schema_org',
			'word': 'Intangible'
		},
		{
			'senseid': '/synset-event-noun-1',
			'explanation': 'An event happening at a certain time at a certain location',
			'source': 'schema_org',
			'word': 'Event'
		},
		{
			'senseid': '/synset-creation-noun-2',
			'explanation': 'The most generic kind of creative work, including books, movies, photographs, software programs, etc.',
			'source': 'schema_org',
			'word': 'Creative Work'
		},
		{
			'senseid': '/synset-entity-noun-1',
			'explanation': 'The most generic type of item',
			'source': 'schema_org',
			'word': 'Thing'
		}
	]
};

saneString =
	function (searchString, callback) {
		if (searchString.length > 60) {
			callback(new Error('Search string <' + searchString + '> was to long'));
		} else {
			callback(null, searchString);
		}
	};

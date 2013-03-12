/*jslint node: true */
'use strict';
var mapping = require('./mapping').declaration;
exports.propertiesList = function (term, callback) {
	var propertyList = mapping.types[term].properties,
		propertiesAndTypes = {},
		i,
		keys,
		orderedPropertiesAndTypes = {};
	if (mapping.types[term].specific_properties) {
		propertyList.concat(mapping.types[term].specific_properties);
	}
	for (i = 0; i < propertyList.length; i += 1) {
		propertiesAndTypes[propertyList[i]] = {
			'ranges' : mapping.properties[propertyList[i]].ranges,
			'comment': mapping.properties[propertyList[i]].comment_plain
		};
	}
	keys = Object.keys(propertiesAndTypes);
	keys.sort();
	for (i = 0; i < keys.length; i += 1) {
		orderedPropertiesAndTypes[keys[i]] = propertiesAndTypes[keys[i]];
	}
	callback(null, orderedPropertiesAndTypes);
};


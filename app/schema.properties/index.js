/*jslint node: true */
'use strict';
var mapping = require('./mapping').declaration;
exports.propertiesList = function (term, callback) {
	var propertyList = mapping.types[term].properties,
		propertiesAndTypes = {},
		i;
	if (mapping.types[term].specific_properties) {
		propertyList.concat(mapping.types[term].specific_properties);
	}
	for (i = 0; i < propertyList.length; i += 1) {
		propertiesAndTypes[propertyList[i]] = mapping.properties[propertyList[i]].ranges;
	}
	callback(null, propertiesAndTypes);
};

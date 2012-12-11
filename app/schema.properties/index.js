'use strict';
var mapping = require('./mapping').declaration;
exports.propertiesList = function (term, callback) {
	var propertyList = mapping.types[term].properties,
		propertiesAndTypes = {},
		i,
		j,
		types,
		type,
		allowedTypes = ['Text', 'URL'];
	for (i = 0; i < propertyList.length; i += 1) {
		types = mapping.properties[propertyList[i]].ranges;
		for (j = 0; j < types.length; j += 1) {
			type = types[j];
			if (allowedTypes.indexOf(type) !== -1) {
				if (!propertiesAndTypes[propertyList[i]]) {
					propertiesAndTypes[propertyList[i]] = [];
				}
				propertiesAndTypes[propertyList[i]].push(type);
			}
		}
	}
	callback(null, propertiesAndTypes);
};
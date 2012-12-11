/*jslint node: true */
'use strict';
var url = require('url'),
	exec = require('child_process').exec,
	wn2schema = require('../../mappings/wn2schema').mapping,
	wn2sumo = require('../../mappings/wn2sumo').mapping,
	schema2parent = require('../../mappings/schema2parent').mapping,
	sumo2parent = require('../../mappings/sumo2parent').mapping,
	findParents = function (synset, callback) {
		exec('perl scripts/parents.pl ' + synset, function (error, stout, stderr) {
			if (error) {
				callback(new Error(error));
			} else if (stderr) {
				callback(new Error(stderr));
			} else {
				callback(null, stout);
			}
		});
	},
	addMappings = function (object, callback) {
		var	mapping = {"synset": object.synset};
		if (wn2schema[object.synset]) {
			mapping.schema_dot_org = wn2schema[object.synset];
		}
		if (wn2sumo[object.offset]) {
			mapping.sumo = wn2sumo[object.offset].sumo;
		}
		callback(null, mapping);
	},
	findLinkMapping = function (link, callback) {
		addMappings(link, function (error, mapping) {
			if (error) {
				callback(error);
			} else {
				var siblings = [],
					i,
					addSiblingMappings = function (error, mappings) {
						if (error) {
							console.log("Error received: " + error);
						} else {
							if (mappings) {
								siblings.push(mappings);
							}
						}
					};
				if (link.siblings) {
					for (i = 0; i < link.siblings.length; i += 1) {
						addMappings(link.siblings[i], addSiblingMappings);
					}
				}
				if (siblings.length > 0) {
					mapping.siblings = siblings;
				}
				callback(null, mapping);
			}
		});
	},
	mapSynset = function (synset, callback) {
		var	json,
			i;
		findParents(synset, function (error, data) {
			if (error) {
				callback(error);
			} else {
				json = JSON.parse(data);
				addMappings(json, function (error, mapping) {
					if (error) {
						callback(error);
					} else {
						var addSiblingMappings = function (error, siblings) {
								if (error) {
									console.log(error);
								} else if (siblings) {
									if (!mapping.siblings) {
										mapping.siblings = [];
									}
									mapping.siblings.push(siblings);
								}
							},
							addLinkMappings = function (error, link) {
								if (error) {
									console.log(error);
								} else if (link) {
									if (!mapping.chain) {
										mapping.chain = [];
									}
									mapping.chain.push(link);
								}
							};
						if (json.siblings && json.siblings.length) {
							for (i = 0; i < json.siblings.length; i += 1) {
								addMappings(json.siblings[i], addSiblingMappings);
							}
						}
						if (json.chain && json.chain.length) {
							for (i = 0; i < json.chain.length; i += 1) {
								findLinkMapping(json.chain[i], addLinkMappings);
							}
						}
						callback(null, mapping);
					}
				});
			}
		});
	},
	parSibParsib = function (mapping, callback) {
		var schema_dot_org = mapping.schema_dot_org,
			sumo = mapping.sumo,
			siblings,
			parents,
			sibling,
			parentSiblings,
			i,
			j;
		if (!(schema_dot_org && sumo)) {
			if (mapping.chain) {
				parents = [];
				for (i = 0; i < mapping.chain.length; i += 1) {
					schema_dot_org = schema_dot_org || mapping.chain[i].schema_dot_org;
					sumo = sumo || mapping.chain[i].sumo;
					if (mapping.chain[i].sumo || mapping.chain[i].schema_dot_org) {
						parents.push({"synset": mapping.chain[i].synset, "schema_dot_org": mapping.chain[i].schema_dot_org, "sumo": mapping.chain[i].sumo});
					}
				}
			}
		}
		if (!(schema_dot_org && sumo)) {
			if (mapping.siblings) {
				siblings = [];
				for (i = 0; i < mapping.siblings.length; i += 1) {
					sibling = {"synset": mapping.siblings[i].synset};
					if (mapping.siblings[i].schema_dot_org) {
						schema_dot_org = schema_dot_org || schema2parent[mapping.siblings[i].schema_dot_org];
						sibling.schema_dot_org = schema2parent[mapping.siblings[i].schema_dot_org];
					}
					if (mapping.siblings[i].sumo) {
						sumo = sumo || sumo2parent[mapping.siblings[i].sumo];
						sibling.sumo = sumo2parent[mapping.siblings[i].sumo];
					}
					siblings.push(sibling);
				}
			}
		}
		if (!(schema_dot_org && sumo)) {
			if (mapping.chain) {
				parentSiblings = [];
				siblings = [];
				for (i = 0; i < mapping.chain.length; i += 1) {
					if (mapping.chain[i].siblings) {
						siblings = [];
						for (j = 0; j < mapping.chain[i].siblings.length; j += 1) {
							sibling = {};
							if (mapping.chain[i].siblings[j].schema_dot_org) {
								schema_dot_org = schema_dot_org || schema2parent[mapping.chain[i].siblings[j].schema_dot_org];
								sibling.schema_dot_org = schema2parent[mapping.chain[i].siblings[j].schema_dot_org];
								sibling.synset = mapping.chain[i].synset;
							}
							if (mapping.chain[i].siblings[j].schema_dot_org) {
								sumo = sumo || mapping.chain[i].sumo;
								sibling.sumo = sumo2parent[mapping.chain[i].siblings[j].sumo];
								sibling.synset = mapping.chain[i].synset;
							}
							if (sibling.synset) {
								siblings.push(sibling);
							}
						}
						if (siblings.length) {
							parentSiblings.push(siblings);
						}
					}
				}
			}
		}
		callback(null, {"synset": mapping.synset, "schema_dot_org": schema_dot_org, "sumo": sumo, "parents": parents, "siblings": siblings, "parentSiblings": parentSiblings});
	},
	sibParRec = function (mapping, callback) {
		var schema_dot_org = mapping.schema_dot_org,
			sumo = mapping.sumo,
			counter = 0,
			i,
			sibling,
			siblings = [],
			parent,
			parents = [],
			link,
			parentSiblings = [];

		if (!(schema_dot_org && sumo)) {
			if (mapping.siblings) {
				siblings = [];
				for (i = 0; i < mapping.siblings.length; i += 1) {
					sibling = {"synset": mapping.siblings[i].synset};
					if (mapping.siblings[i].schema_dot_org) {
						schema_dot_org = schema_dot_org || schema2parent[mapping.siblings[i].schema_dot_org];
						sibling.schema_dot_org = schema2parent[mapping.siblings[i].schema_dot_org];
					}
					if (mapping.siblings[i].sumo) {
						sumo = sumo || sumo2parent[mapping.siblings[i].sumo];
						sibling.sumo = sumo2parent[mapping.siblings[i].sumo];
					}
					siblings.push(sibling);
				}
			}
		}
		if (mapping.chain) {
			for (counter = 0; counter < mapping.chain.length; counter += 1) {
				link = mapping.chain[counter];
				parent = {'synset': link.synset, 'schema_dot_org': link.schema_dot_org, 'sumo' : link.sumo, 'siblings': []};
				schema_dot_org = schema_dot_org || link.schema_dot_org;
				sumo = sumo || link.sumo;
				if (link.siblings) {
					for (i = 0; i < link.siblings.length; i += 1) {
						sibling = {"synset": link.siblings[i].synset};
						if (link.siblings[i].schema_dot_org) {
							schema_dot_org = schema_dot_org || schema2parent[link.siblings[i].schema_dot_org];
							sibling.schema_dot_org = schema2parent[link.siblings[i].schema_dot_org];
						}
						if (link.siblings[i].sumo) {
							sumo = sumo || sumo2parent[link.siblings[i].sumo];
							sibling.sumo = sumo2parent[link.siblings[i].sumo];
						}
						if (sibling.sumo || sibling.schema_dot_org) {
							parent.siblings.push(sibling);
						}
					}
				}
			}
			if (parent.sumo || parent.schema_dot_org || parent.siblings) {
				parents.push(parent);
			}
			counter += 1;
		}
		callback(null, {"synset": mapping.synset, "schema_dot_org": schema_dot_org, "sumo": sumo, "parents": parents, "siblings": siblings, "parentSiblings": parentSiblings});
	};
/**
	Finds the closest mappings from a synset to several ontologies using a few different algorithms
	@param {String} synset: a synset in the form synset-<word>-<lexical class>-<sense number>
	@param {Function} callback($error, $result):
	The callback is called when the best mappings have been found for each algorithm
	$error {Object}: The error encountered or null
	$result {Object}: An object of the form
	{
		synset {String}: The synset which was analysed
		[sumo {Array}: The best mappings from the different algorithms to the SUMO ontology]
		[schema_dot_org {Array}: The best mappings from the different algorithms to the schema.org ontology]		
		// In addition the discovered mappings are returned for analysis purposes
	}
*/
exports.bestFit = function (synset, callback) {
	var fit = {'synset': synset, sumo: [], schema_dot_org: []};
	mapSynset(synset, function (error, mapping) {
		if (error) {
			callback(error);
		} else {
			sibParRec(mapping, function (recError, recResults) {
				parSibParsib(mapping, function (linError, linResults) {
					if (recError || linError) {
						console.log(recError);
						console.log(linError);
						callback(new Error("Error"));
					} else {
						if (linResults.sumo) {
							fit.sumo.push(linResults.sumo);
						}
						if (linResults.schema_dot_org) {
							fit.schema_dot_org.push(linResults.schema_dot_org);
						}
						if (recResults.sumo) {
							fit.sumo.push(recResults.sumo);
						}
						if (recResults.schema_dot_org) {
							fit.schema_dot_org.push(recResults.schema_dot_org);
						}
						fit.lin = {
							'schema_dot_org' : linResults.schema_dot_org,
							'sumo' : linResults.sumo
						};
						fit.rec = {
							'schema_dot_org' : recResults.schema_dot_org,
							'sumo' : recResults.sumo
						};
						callback(null, fit);
					}
				});
			});
		}
	});
};
/**
*	Creates a mapping tree of the synset.
*	A mapping tree contains all the synsets sibling senses (hyponymes of hypernymes),
*	all the ancestors of the synset, and all the siblings of the ancestors.
*	@param {String} synset: a synset in the form synset-<word>-<lexical class>-<sense number>
*	@param {Function} callback($error, $result):
*	The callback is called when the mapping tree is completed
*	$error {Object}: The error encountered or null
*	$result {Object}: an Object of the form 
*	{
*		synset {String}: The synset which was mapped
*		chain {Array}: The ancestor chain, each element is an object in the form: 
*		{
*			synset {String}: The ancestor synset
*			[sumo {String}: The mapping to the SUMO ontology]
*			[schema_dot_org {String}: The mapping to the schema.org ontology]
*			siblings {Array}: The sibling senses, each element is an object in the form: 
*			{
*				synset {String}: The ancestor synset
*				[sumo {String}: The mapping to the SUMO ontology]
*				[schema_dot_org {String}: The mapping to the schema.org ontology]
*			}
*		}
*		siblings {Array}: The sibling senses, each element is an object in the form: 
*		{
*			synset {String}: The ancestor synset
*			[sumo {String}: The mapping to the SUMO ontology]
*			[schema_dot_org {String}: The mapping to the schema.org ontology]
*		}
*		[sumo {String}: The mapping to the SUMO ontology]
*		[schema_dot_org {String}: The mapping to the schema.org ontology]		
*	}
*/

exports.mappings = function (synset, callback) {
	mapSynset(synset, callback);
};
/**
*	Finds the hypernyme(s) of the synset
*	@param {String} synset: a synset in the form synset-<word>-<lexical class>-<sense number>
*	@param {Function} callback($error, $result):
*	The callback function is called when the hypernyme(s) of the word has been found
*	$error {Object}: The error encountered or null
*	$result {Object}: An object in the form:
*	{
*		parents {Array}: the hypernyme(s) of the parent
*	}
*/
exports.parent = function (synset, callback) {
	exec('perl scripts/parent.pl ' + synset, function (error, stout, stderr) {
		if (error) {
			callback({"error": error});
		} else if (stderr) {
			callback({"error": stderr});
		} else {
			callback(null, JSON.parse(stout));
		}
	});
};

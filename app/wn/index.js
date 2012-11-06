'use strict';
var http = require('http'),
	url = require('url'),
	exec = require('child_process').exec,
	wn2schema = require('../../mappings/wn2schema').mapping,
	wn2sumo = require('../../mappings/wn2sumo').mapping,
	schema2parent = require('../../mappings/schema2parent').mapping,
	sumo2parent = require('../../mappings/sumo2parent').mapping,
	findParents = function (synset, callback) {
		exec('perl app/perl/parents ' + synset, function (error, stout, stderr) {
			if (error) {
				callback(new Error(error));
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
				for (i = 0; i < link.siblings.length; i += 1) {
					addMappings(link.siblings[i], addSiblingMappings);
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
								if (siblings) {
									if (!mapping.siblings) {
										mapping.siblings = [];
									}
									mapping.siblings.push(siblings);
								}
							},
							addLinkMappings = function (error, link) {
								if (link) {
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
	findBestFit = function (mapping, callback) {
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
	};

exports.bestFit = function (req, res) {
	var synset = url.parse(req.url, true).query.q;
	mapSynset(synset, function (error, mapping) {
		if (error) {
			res.writeHead(500, {'Content-Type': "application/json"});
			res.end(JSON.stringify(error));
		} else {
			findBestFit(mapping, function (error, bestFit) {
				if (error) {
					res.writeHead(500, {'Content-Type': "application/json"});
					res.end(JSON.stringify(error));
				} else {
					res.writeHead(200, {'Content-Type': "application/json"});
					res.end(JSON.stringify(bestFit));
				}
			});
		}
	});
};

exports.mappings = function (req, res) {
	var synset = url.parse(req.url, true).query.q;
	mapSynset(synset, function (error, mapping) {
		if (error) {
			res.writeHead(500, {'Content-Type': "application/json"});
			res.end(JSON.stringify(error));
		} else {
			res.writeHead(200, {'Content-Type': "application/json"});
			res.end(JSON.stringify(mapping));
		}
	});
};

exports.parent = function (req, res) {
	var synset = url.parse(req.url, true).query.q;
	exec('perl app/perl/parent ' + synset, function (error, stout, stderr) {
		if (error) {
			res.writeHead(500, {'Content-Type': 'application/json'});
			res.end('{"error": ' + error + '}');
		} else {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(stout);
		}
	});
};

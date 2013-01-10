/*jslint node: true */
'use strict';
exports.dbLocation = 'mongodb://localhost:3001/';
exports.documents = 'documents';
exports.cache = 'cache';
exports.intertalCommentStart = /<!\-\-SCRIPT/g;
exports.intertalCommentEnd = /SCRIPT\-\->/g;
exports.htmlCommentStart = /SEMTAG-START-COMMENT/g;
exports.htmlCommentEnd = /SEMTAG-END-COMMENT/g;

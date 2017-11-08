"use strict";
var TAG = 'mongoQuery.js';
var dbConfig = require('./config.js');

exports.upsertOne = function (collection, query, updates, callback) {
	var db = dbConfig.mongoDbConn;
	var fhColl = db.collection(collection);
	fhColl.updateOne(query, updates, {
		upsert: true
	}, function (err, response) {
		return callback(err, response);
	});
};

exports.findOne = function (collection, query, fields, options, callback) {
	var db = dbConfig.mongoDbConn;
	var fhColl = db.collection(collection);
	options = options || {};
	fields = fields || {};
	fhColl.findOne(query, fields, function (err, response) {
		return callback(err, response);
	});
};

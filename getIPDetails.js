"use strict";
var TAG = 'getIPDetails.js';
var config = require('./mongoQurey.js');
var dBconfig = require('./config.js');
var util = require('./util.js');
// interface to provide access to the geolocation data
exports.getIPDetails = function (inputDbConfig, IPaddress, cb) {

	inputDbConfig = util.formatDbConfig(inputDbConfig);

	dBconfig.createMongoConn(inputDbConfig, function (error) {
		if (error) {
			console.log('Unable to connect to mongodb. Error:', error);
			return cb(true, error);
		} else {
			var db = dBconfig.mongoDbConn
			console.log("getIPDetails");
			var query = {
				"ip_address": IPaddress
			};
			var fields = {
				"_id": 0
			};
			config.findOne(inputDbConfig.ipDetailsColl, query, fields, null, function (err, response) {
				if (err) {
					console.log("err" + err.stack);
					db.close();					
					return cb(true, "Error fetching IP Details");
				} else {
					console.log(response);
					db.close();					
					return cb(false, response);
				}
			});
		}
	});
};
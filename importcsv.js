"use strict";
var TAG = 'importcsv.js';
var fs = require('fs');
var parse = require('csv').parse;
var async = require('async');
var path = require('path');
var config = require('./mongoQurey.js');
var dBconfig = require('./config.js');
var csv = require('fast-csv');
var V = require('jsonschema').Validator;
var validator = new V();
var rowValidation = require('./validation.js').rowValidation;
var ElapsedTime = require('elapsed-time')
var _ = require('underscore');
var util = require('./util.js');

exports.importData = function (inputDbConfig, filePath, callback) {

	var et = ElapsedTime.new().start();
	inputDbConfig = util.formatDbConfig(inputDbConfig);

	// Read ip address data from csv file and write it to database.
	async.waterfall([
		async.apply(readCSV, filePath),
		parseCSV,
		async.apply(connectMongo, inputDbConfig),
		async.apply(saveDataToDB, filePath)
	], function (err, result) {
		if (err) {
			console.log(result);
			return callback(true, "failure");
		} else {
			console.log('data saved to db');
			console.log('Elapsed Time: ' + et.getValue());
			result['elapsedTime'] = et.getValue();
			result['message'] = 'File uploaded successfully';
			return callback(false,result);
		}
	});
};

// Validate extension and read csv file.
function readCSV(filePath, cb) {
	var extname = path.parse(filePath).ext;
	if (extname == ".csv") {
		fs.readFile(filePath, function (err, data) {
			if (err) {
				return cb(true, err);
			}
			return cb(null, data);
		});
	} else {
		return cb(true, "No files with .csv found");
	}
}

// parse csv file 
function parseCSV(data, cb) {
	parse(data, function (err, parsedData) {
		if (err) {
			return cb(true, err);
		}
		return cb(null);
	});
}

// establish mongo connection
function connectMongo(inputDbConfig, cb) {
	dBconfig.createMongoConn(inputDbConfig, function (error) {
		if (error) {
			console.log('Unable to connect to mongodb. Error:', error);
			return cb(true, error);
		} else {
			var db = dBconfig.mongoDbConn
			console.log("Connected to DB successfully");
			// Create Index on ip_addresss;
			dBconfig.createUniqueIndex(db, dBconfig.ipDetailsColl, function (error) {
				return cb(false, db);
			});
		}
	});
}

// validate and save the records to database.
function saveDataToDB(filePath, db, cb) {
	var count = 0; // total records in csv
	var sucCount = 0; // total records inserted into database. 
	var duplicateCount = 0; // total duplicate records found (upsert records)
	var wrongFormatCount = 0; // total records rejected as invalid records.
	var errCount = 0; // total records failed to insert into db (duplicate + invalid format + any other internal errors)
	var dupliacteRows = [];
	var wrongFormatRows = [];
	var mongoErrorRows = [];

	/*csv.fromPath(filePath, {
			headers: true
		})*/
	var stream = fs.createReadStream(filePath);
	csv.fromStream(stream,{
		       headers: true
		})
		.validate(function (data, next) {
			console.log("count: " + (++count));
			var validation_result = validator.validate(data, rowValidation);
			if (validation_result.errors.length > 0) {
				++wrongFormatCount;
				++errCount;
				wrongFormatRows.push({ 'rowNo': count, 'rowData': data,'error': util.makeErrorObject(validation_result.errors)});				
				console.log("inside errors");
				next(null);
			} else {
				data = formatRow(data);
				var query = {
					"ip_address": data.ip_address
				};
				config.upsertOne(dBconfig.ipDetailsColl, query, data, function (err, response) {
					if (err) {
						console.log("Error inserting data");
						errCount = errCount + 1;
						mongoErrorRows.push({ 'rowNo': count, 'rowData': data,'error':err});				
						
						next(null);

					} else {
						if ("upserted" in response.result && response.result.upserted.length > 0) {
							++sucCount;
							console.log("sucCount: " + sucCount);
						} else {
							++errCount;
							++duplicateCount;
							dupliacteRows.push({ 'rowNo': count, 'rowData': data,'error': 'Dupliacte IP'});
						}
						next(null)
					}
				});
			}
		})
		.on("data", function (data) {})
		.on("end", function () {
			console.log('end')
			console.log('total num of records : ' + count);
			console.log('total num of records inserted: ' + sucCount);
			console.log('total num of records rejeted: ' + errCount);
			console.log('total num of records with wrong format: ' + wrongFormatCount);
			console.log('total num of records duplicate records: ' + duplicateCount);
			var statisticsObj = {
				'totalRecords': count,
				'insertedRecords': sucCount,
				'rejectedRecords': errCount,
				'wrongFormatRecords': wrongFormatCount,
				'duplicateRecords': duplicateCount
			};

			var errorsObj = {
				'dupliacteRows': dupliacteRows,
				'wrongFormatRows': wrongFormatRows,
				'mongoErrorRows': mongoErrorRows
			};

			var result = {
				'statistics': statisticsObj,
				'errors': errorsObj
			};

			db.close();
			return cb(false, result);
		});

}

// To make sure, we import only the required columns and ignore any other data.
var formatRow = (row) => {
	return _.pick(row, 'ip_address', 'country_code', 'country', 'city', 'latitude', 'longitude', 'mystery_value');
};

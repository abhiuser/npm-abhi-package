var importcsv = require('./importcsv.js');
var getIPDetails1 = require('./getIPDetails');
var V = require('jsonschema').Validator;
var validator = new V();
var dbConfigValidation = require('./validation.js').dbConfigValidation;
var util = require('./util.js');

exports.getIPDetails = (inputDbConfig, ip, cb) => {

    console.log("inside getIPDetails");

    var validation_result = validator.validate(inputDbConfig, dbConfigValidation);

    var errors = [];

    if (validation_result.errors.length > 0) {
        errors = util.makeErrorObject(validation_result.errors);
    }

    if (!ip || ip.toString().trim().length == 0) {
        errors.push("IP Address is Mandatory");
    }
    if (errors.length > 0) {
        console.log("inside errors");
        return cb(true, {
            'errors': errors
        })
    } else {
        console.log("no errors");
        getIPDetails1.getIPDetails(inputDbConfig, ip, (err, res) => {
            return cb(err, res);
        });
    }
};

exports.importData = (dbConfig, filePath, cb) => {

    console.log("isnide importData");
    var validation_result = validator.validate(dbConfig, dbConfigValidation);

    var errors = [];

    if (validation_result.errors.length > 0) {
        errors = util.makeErrorObject(validation_result.errors);
    }
    if (!filePath || filePath.toString().trim().length == 0) {
        errors.push("Invalid File Path");
    }
    if (errors.length > 0) {
        console.log("inside errors");
        return cb(true, errors)
    } else {
        console.log("no errors");
        importcsv.importData(dbConfig, filePath, (err, res) => {
            return cb(err, res);
        });
    }
};
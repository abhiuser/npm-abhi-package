exports.makeErrorObject = (validationErrors) => {
    var errors = [];
    console.log("validationErrors.length: " + validationErrors.length);
    console.log(JSON.stringify(validationErrors));
    for (var error in validationErrors) {
        var message = validationErrors[error].stack.includes('instance.') ? validationErrors[error].stack.replace('instance.', '') : validationErrors[error].stack;
        console.log("message: " + message);
        errors.push(message);
    }
    return errors;
};

exports.formatDbConfig = function (inputDbConfig) {
    var formattedDbConfig = {
        'type': inputDbConfig.connectionType,
        'user': inputDbConfig.username,
        'pwd': inputDbConfig.password,
        'mongod': inputDbConfig.hosts,
        'database': inputDbConfig.databaseName,
        'ipDetailsColl': inputDbConfig.ipDetailsColl
    };
    return formattedDbConfig;
};
exports.rowValidation = {
    "type": "object",
    "required": true,
    "properties": {
        "ip_address": {
            "type": "string",
            "required": true,
            "minLength": 1
        },
        "country_code": {
            "type": "string",
            "required": true,
            "minLength": 1
        },
        "country": {
            "type": "string",
            "required": true,
            "minLength": 1
        },
        "city": {
            "type": "string",
            "required": true,
            "minLength": 1
        },
        "latitude": {
            "type": "string",
            "required": true,
            "minLength": 1
        },
        "longitude": {
            "type": "string",
            "required": true,
            "minLength": 1
        },
        "mystery_value": {
            "type": "string",
            "required": true,
            "minLength": 1
        }
    }
};

exports.dbConfigValidation = {
    "type": "object",
    "required": true,
    "properties": {
        "connectionType": {
            "type": "string",
            "required": true
        },
        "username": {
            "type": "string",
            "required": true
        },
        "password": {
            "type": "string",
            "required": true
        },
        "hosts": {
            "type": "array",
            "items": {
                "type": "string",
                "required": true
            }
        },
        "databaseName": {
            "type": "string",
            "required": true,
            "minLength": 1
        },
        "ipDetailsColl": {
            "type": "string",
            "required": true,
            "minLength": 1
        }
    }
};
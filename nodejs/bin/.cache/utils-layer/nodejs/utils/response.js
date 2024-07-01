'use strict';
exports.success = function (message, statusCode) {
    return {
        statusCode: statusCode !== null && statusCode !== void 0 ? statusCode : 200,
        body: JSON.stringify(message),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET'
        }
    };
};
exports.error400 = function (message) {
    return {
        statusCode: 400,
        body: JSON.stringify(message),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET'
        }
    };
};
exports.error500 = function (message) {
    return {
        statusCode: 500,
        body: JSON.stringify(message),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET'
        }
    };
};
exports.validationError = function (errors) {
    return {
        statusCode: 400,
        body: JSON.stringify('Incorrect parameters: ' + errors),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET'
        }
    };
};

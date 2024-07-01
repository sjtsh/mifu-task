'use strict';
const ObjectHelper = require('/opt/nodejs/utils/object-helper');
const yup = require('yup');
exports.getUserId = function (event) {
    if (process.env.ENV.includes('dev') && event.requestContext.identity.cognitoAuthenticationProvider == null) {
        return '12345TESTACC';
    }
    return event.requestContext.identity.cognitoAuthenticationProvider.split(':')[2];
};
exports.getParameter = function (event, parameter) {
    // Check if queryStringParameters exists and is not null
    if (event && event.queryStringParameters && Object.prototype.hasOwnProperty.call(event.queryStringParameters, parameter)) {
        // Retrieve the value
        let value = event.queryStringParameters[parameter];
        // Convert "true" or "false" string to boolean, if applicable
        if (value.toLowerCase() === 'true') {
            return true;
        }
        else if (value.toLowerCase() === 'false') {
            return false;
        }
        // Attempt to convert to number, if applicable
        let numberValue = Number(value);
        if (!isNaN(numberValue)) {
            return numberValue;
        }
        // Return the value as is for other cases
        return value;
    }
    // Return null if queryStringParameters is not set or the parameter doesn't exist
    return null;
};
exports.getPathParameter = function (event, parameter) {
    return event.pathParameters[parameter];
};
exports.getBodyParameter = function (event, parameters) {
    var _a;
    const json_body = JSON.parse(event.body);
    if (Array.isArray(parameters)) {
        return ObjectHelper.only(json_body, parameters);
    }
    return (_a = json_body[parameters]) !== null && _a !== void 0 ? _a : null;
};
exports.getFileKeyFromS3Event = function (event) {
    return event.detail.object.key;
};
exports.getFileSizeFromS3Event = function (event) {
    return event.detail.object.size;
};
exports.validateSchema = async function (schema, data) {
    try {
        await schema.validate(data, { abortEarly: false });
        // If validation passes, return an object indicating no failure
        return {
            failed: false,
        };
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            // If validation fails, return an object with failure details
            return {
                failed: true,
                errors: error.errors
            };
        }
        console.log('Schema validation failed: ', JSON.stringify(error));
        // Rethrow the error if it's not a ValidationError
        throw error;
    }
};

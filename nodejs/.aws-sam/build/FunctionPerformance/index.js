'use strict';
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const { performanceController } = require('./performanceController');

dotenv.config();
AWS.config.update({ region: process.env.REGION, dynamodb: { endpoint: process.env.DYNAMO_LOCAL_ENDPT } });

exports.handler = event => {
    return performanceController.scanData(event.queryStringParameters);
};

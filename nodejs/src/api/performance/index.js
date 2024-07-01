'use strict';
const dotenv = require('dotenv');
const { performanceController } = require('./performanceController');

dotenv.config();
exports.handler = event => {
    return performanceController.scanData(event.queryStringParameters);
};

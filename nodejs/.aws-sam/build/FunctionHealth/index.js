'use strict';
const Response = require('/opt/nodejs/utils/response');

exports.handler = async () => {
    console.log('API Health Check');

    return Response.success('Healthy!');
};

'use strict';
const CognitoIdentityServiceProvider = require('aws-sdk/clients/cognitoidentityserviceprovider');
exports.cognitoClient = new CognitoIdentityServiceProvider({ region: process.env.REGION });
exports.getCognitoUsername = async (sub) => {
    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Filter: `sub = "${sub}"`,
    };
    return exports.cognitoClient
        .listUsers(params)
        .promise()
        .then((response) => {
        if (response.Users.length === 0) {
            console.log('Unable to find user from sub');
            return {
                failed: true,
                error: 'No user found'
            };
        }
        return {
            failed: false,
            data: response.Users[0].Username
        };
    })
        .catch((err) => {
        console.log('Error getting user from sub', err);
        return {
            failed: true,
            error: err
        };
    });
};

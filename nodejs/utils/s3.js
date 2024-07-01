'use strict';

const S3 = require('aws-sdk/clients/s3');
const FileUtils = require('./file');
const { randomUUID } = require('crypto');

exports.s3Client = new S3({ region: process.env.REGION, signatureVersion: 'v4' });
exports.S3_PRESIGNED_URL_OPERATIONS = {
    PRESIGNED_URL_TIMEOUT: 1800, // 30 minutes
    PUT: 'putObject',
    GET: 'getObject',
};

exports.getRandomID = function () {
    return randomUUID();
};

exports.getBucketName = function (name) {
    return process.env.DATA_ENV + '-mifu-' + name;
};

exports.getPresignedURL = function (bucket_name, operation, expiry_in_seconds, file_key) {
    // console.log('signining: ' + file_key + ' in bucket: ' + bucket_name + ' for operation: ' + operation + ' with expiry: ' + expiry_in_seconds);
    try {
        if (FileUtils.getMediaType(file_key) === undefined) {
            return 'Unsupported media type';
        }

        let params = {
            Bucket: bucket_name,
            Key: file_key,
            Expires: expiry_in_seconds,
        };

        if (operation === exports.S3_PRESIGNED_URL_OPERATIONS.PUT) {
            params.ContentType = FileUtils.getMediaType(file_key);
        }

        return exports.s3Client.getSignedUrl(operation, params);
    } catch (err) {
        console.log(`Crashed while generating pre-signed URL. Bucket: ${bucket_name}, file_key: ${file_key}`);
        console.log(err);
        throw err;
    }
};

exports.copyObject = async function (source_bucket, target_bucket, file_key) {
    var params = {
        Bucket: target_bucket,
        CopySource: encodeURI(`${source_bucket}/${file_key}`),
        Key: file_key,
    };
    return await exports.s3Client
        .copyObject(params)
        .promise()
        .then(data => {
            console.log(`Copied ${file_key} from ${source_bucket} to ${target_bucket}`, data);
            return true;
        })
        .catch(err => {
            console.log(`Could not copy ${file_key} from ${source_bucket} to ${target_bucket}`, err);
            return false;
        });
};

exports.deleteObject = async function (bucket, file_key) {
    var params = {
        Bucket: bucket,
        Key: file_key,
    };

    return await exports.s3Client
        .deleteObject(params)
        .promise()
        .then(data => {
            console.log(`Deleted ${file_key} from ${bucket}`, data);
            return {
                failed: false,
            };
        })
        .catch(err => {
            console.log(`Could not delete ${file_key} from ${bucket}`, err);
            return {
                failed: true,
                error: err,
            };
        });
};

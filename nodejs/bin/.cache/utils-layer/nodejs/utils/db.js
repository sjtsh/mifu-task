'use strict';
const AWS = require('aws-sdk');
const { unmarshall } = AWS.DynamoDB.Converter;
const { randomUUID } = require('crypto');
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const ObjectHelper = require('/opt/nodejs/utils/object-helper');

AWS.config.update({ region: process.env.REGION, dynamodb: { endpoint: process.env.DYNAMO_LOCAL_ENDPT } });
exports.ddbClient = new DocumentClient({ region: process.env.REGION });

//--------------------//
exports.getRandomID = function (length) {
    if (length) {
        return randomUUID().slice(0, length);
    }
    return randomUUID();
};
exports.getDateSuffix = function () {
    return Date.now();
};
exports.getTableName = function (name) {
    return process.env.DATA_ENV + '_' + name;
};
exports.getCampaignId = function (id) {
    if (typeof id === 'string' && id.startsWith('c_')) {
        return id;
    }
    return 'c_' + id;
};
exports.getPrefixedId = function (prefix, id) {
    if (typeof id === 'string' && id.startsWith(prefix)) {
        return id;
    }
    return prefix + id;
};
exports.removePrefixedId = function (prefix, id) {
    return id.replace(prefix, '');
};
/**
 * @param {string} table
 * @param {number} limit
 * @param {number} index
 * @param {string} KeyConditionExpression
 * @param {string{}} ExpressionAttributeValues
 * @param {string{}} ExpressionAttributeNames
 * @returns {QueryOutput}
 */
exports.pagedIndexQuery = async function (
    table,
    index,
    limit,
    KeyConditionExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames
) {
    let result, accumulated, ExclusiveStartKey;
    do {
        const params = {
            TableName: table,
            IndexName: index,
            ExclusiveStartKey,
            Limit: limit,
            KeyConditionExpression: KeyConditionExpression,
            ExpressionAttributeValues: ExpressionAttributeValues,
            ExpressionAttributeNames: ExpressionAttributeNames,
        };
        result = await exports.ddbClient.query(params).promise();
        ExclusiveStartKey = result.LastEvaluatedKey;
        accumulated = [...accumulated, ...result.Items];
    } while (result.Items.length || result.LastEvaluatedKey);
    return accumulated;
    //TODO: Error handling
};
/**
 * @param {string} table
 * @param {string[]} keys
 * @returns {QueryOutput}
 */
exports.batchGet = async function (table, keys) {
    var params = {
        RequestItems: {
            [table]: {
                Keys: keys,
            },
        },
    };
    return await exports.ddbClient.batchGet(params).promise();
};
/**
 * Writes batches of keys to the specified DynamoDB table and returns the count of successful and failed writes.
 *
 * @param {string} table
 * @param {Array<Object>} keys
 * @returns {Promise<{failed: boolean, num_succeeded: number, num_failed: number, error?: Error}>}
 */
exports.batchWrite = async function (table, keys) {
    let succeeded = 0;
    let failed = 0;
    try {
        let unprocessedKeys = keys;
        do {
            const writeRequests = unprocessedKeys.splice(0, 25).map(key => ({
                PutRequest: {
                    Item: key,
                },
            }));
            const params = {
                RequestItems: {
                    [table]: writeRequests,
                },
            };
            console.log('Batch write params', JSON.stringify(params));
            const result = await exports.ddbClient.batchWrite(params).promise();
            const processedCount = writeRequests.length;
            if (result.UnprocessedItems && result.UnprocessedItems[table]) {
                failed += result.UnprocessedItems[table].length;
                succeeded += processedCount - result.UnprocessedItems[table].length;
                unprocessedKeys = result.UnprocessedItems[table].map(writeRequest => writeRequest.PutRequest.Item);
            } else {
                succeeded += processedCount;
            }
        } while (unprocessedKeys.length);
    } catch (err) {
        console.error('Batch write failed', err);
        // Return the error along with the successful and failed counts
        return {
            failed: true,
            error: err,
            num_succeeded: succeeded,
            num_failed: failed,
        };
    }
    // Return the final counts of successful and failed writes
    return {
        failed: false,
        num_succeeded: succeeded,
        num_failed: failed,
    };
};
/**
 * Writes batches of keys to the specified DynamoDB table and returns the count of successful and failed deletes.
 *
 * @param {string} table
 * @param {Array<Object>} keys
 * @returns {Promise<{failed: boolean, num_succeeded: number, num_failed: number, error?: Error}>}
 */
exports.batchDelete = async function (table, keys) {
    let succeeded = 0;
    let failed = 0;
    try {
        let unprocessedKeys = keys;
        do {
            const deleteRequests = unprocessedKeys.splice(0, 25).map(Key => ({
                DeleteRequest: {
                    Key,
                },
            }));
            const params = {
                RequestItems: {
                    [table]: deleteRequests,
                },
            };
            console.log('Batch delete params', JSON.stringify(params));
            const result = await exports.ddbClient.batchWrite(params).promise();
            const processedCount = deleteRequests.length;
            if (result.UnprocessedItems && result.UnprocessedItems[table]) {
                failed += result.UnprocessedItems[table].length;
                succeeded += processedCount - result.UnprocessedItems[table].length;
                unprocessedKeys = result.UnprocessedItems[table].map(writeRequest => writeRequest.DeleteRequest.Item);
            } else {
                succeeded += processedCount;
            }
        } while (unprocessedKeys.length);
    } catch (err) {
        console.error('Batch delete failed', err);
        // Return the error along with the successful and failed counts
        return {
            failed: true,
            error: err,
            num_succeeded: succeeded,
            num_failed: failed,
        };
    }
    // Return the final counts of successful and failed writes
    return {
        failed: false,
        num_succeeded: succeeded,
        num_failed: failed,
    };
};
/**
 * Generates UpdateExpression for DynamoDB UpdateItem
 */
exports.generateUpdateExpression = function (object_to_update) {
    let updateExpression = 'set ';
    Object.keys(object_to_update).forEach(function (key) {
        if (object_to_update[key] !== undefined) {
            updateExpression += `#${key} = :${key},`;
        }
    });
    return updateExpression.slice(0, -1);
};
/**
 * Generates ExpressionAttributeValues for DynamoDB UpdateItem
 */
exports.generateExpressionAttributeValues = function (object_to_update) {
    const keyValues = Object.keys(object_to_update).map(key => {
        if (object_to_update[key] !== undefined) {
            const newKey = `:${key}`;
            return { [newKey]: object_to_update[key] };
        }
    });
    return Object.assign({}, ...keyValues);
};
/**
 * Generates ExpressionAttributeNames for DynamoDB UpdateItem
 */
exports.generateExpressionAttributeNames = function (object_to_update) {
    const keyValues = Object.keys(object_to_update).map(key => {
        if (object_to_update[key] !== undefined) {
            const newKey = `#${key}`;
            return { [newKey]: key };
        }
    });
    console.log(Object.assign({}, ...keyValues));
    return Object.assign({}, ...keyValues);
};
exports.generateUpdateExpressionForMap = function (mapName, object_to_update) {
    let updateExpression = 'SET ';
    Object.keys(object_to_update).forEach(function (key) {
        if (object_to_update[key] !== undefined) {
            updateExpression += `${mapName}.#${key} = :${key}, `;
        }
    });
    return updateExpression.slice(0, -2); // Remove the last comma and space
};
/**
 * Generates RemoveExpression for DynamoDB UpdateItem to remove items from a map.
 * @param {string} mapName - The name of the map attribute in the DynamoDB table.
 * @param {Array} deleteIds - An array of keys to remove from the map.
 * @return {string} The generated RemoveExpression.
 */
exports.generateRemoveExpressionForMap = function (mapName, deleteIds) {
    let removeExpression = '';
    deleteIds.forEach((id, index) => {
        removeExpression += `${mapName}.${id}`;
        if (index < deleteIds.length - 1) {
            removeExpression += ', ';
        }
    });
    return removeExpression;
};
/**
 * Finds given keys in UserAttributes object of Cognito
 * @param {object} user_attributes
 * @param {string} csv_keys
 */
exports.findKeysInCognitoUserAttributes = function (user_attributes, csv_keys) {
    const keys = csv_keys.split(',');
    const result = {};
    keys.forEach(key => {
        key = key.trim();
        let tuple = ObjectHelper.find(user_attributes, { Name: key });
        result[key] = tuple === undefined ? null : tuple.Value;
    });
    return result;
};
exports.getUTCDate = function () {
    let utc_date_string = new Date().toUTCString();
    return new Date(utc_date_string).toISOString();
};
exports.splitArray = (arr, fn) =>
    arr.reduce(
        (acc, val, i, arr) => {
            acc[fn(val, i, arr) ? 0 : 1].push(val);
            return acc;
        },
        [[], []]
    );
exports.getPaginatedDataFromQuery = async function (params) {
    const _getData = async (params, startKey) => {
        console.log(startKey);
        if (startKey) {
            params.ExclusiveStartKey = startKey;
        }
        return exports.ddbClient.query(params).promise();
    };
    let lastEvaluatedKey = null;
    let rows = [];
    do {
        const result = await _getData(params, lastEvaluatedKey);
        rows = rows.concat(result.Items);
        lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);
    return rows;
};
exports.getPaginatedDataFromQuery = async function (params, start_key, page_size, scan_forward = true) {
    if (start_key) {
        params.ExclusiveStartKey = start_key;
    }
    if (page_size) {
        params.Limit = page_size;
    }
    params.ScanIndexForward = scan_forward;
    return exports.ddbClient
        .query(params)
        .promise()
        .then(data => {
            return {
                Items: data.Items,
                LastEvaluatedKey: data.LastEvaluatedKey,
                failed: false,
            };
        })
        .catch(err => {
            console.log('Error Getting Item: ' + JSON.stringify(err));
            return {
                failed: true,
                error: err,
            };
        });
};
exports.getStreamTriggerRecord = function (record) {
    const keys = unmarshall(record.dynamodb.Keys);
    let response = {
        event_name: record.eventName,
        keys: keys,
    };
    if (record.eventName !== 'INSERT') {
        //Not Insert (Old Image Exists)
        const old_image = unmarshall(record.dynamodb.OldImage);
        delete old_image.id;
        delete old_image.recType;
        response.old_image = old_image;
    }
    if (record.eventName !== 'REMOVE') {
        //Not Delete (New Image Exists)
        const new_image = unmarshall(record.dynamodb.NewImage);
        delete new_image.id;
        delete new_image.recType;
        response.new_image = new_image;
    }
    return response;
};

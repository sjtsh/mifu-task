'use strict';
const SQS = require('aws-sdk/clients/sqs');
exports.sqs = new SQS({ region: process.env.REGION });
exports.getQueueURL = function (queue_name) {
    return 'https://sqs.'
        + process.env.REGION
        + '.amazonaws.com/'
        + process.env.ACCOUNTID
        + '/'
        + process.env.ENV
        + '_'
        + queue_name;
};
exports.splitMessagesIntoBatches = function (messages, max_batch_size = 10) {
    const batches = [];
    let batch = [];
    for (let i = 0; i < messages.length; i++) {
        batch.push(messages[i]);
        if (batch.length >= max_batch_size) {
            batches.push(batch);
            batch = [];
        }
    }
    if (batch.length > 0) {
        batches.push(batch);
    }
    return batches;
};
exports.sendBulkMessages = async function (queue_name, messages) {
    const batches = exports.splitMessagesIntoBatches(messages);
    const promises = batches.map(async (batch) => {
        const params = {
            Entries: batch,
            QueueUrl: exports.getQueueURL(queue_name)
        };
        return exports.sqs
            .sendMessageBatch(params)
            .promise()
            .then(data => {
            console.log('Sent Bulk Messages: ' + JSON.stringify(data));
            return {
                failed: false,
                data: data
            };
        })
            .catch(err => {
            console.log('Error sending bulk messages: ' + JSON.stringify(err));
            return {
                failed: true,
                error: err
            };
        });
    });
    return await Promise.all(promises);
};
/**
 *
 * @param {string} id
 * @param {number} length
 * @returns
 */
exports.sanitizeId = function (id, length) {
    return id.replace(/[^\w-]/g, '').substring(0, length);
};
exports.getMessageItems = function (event) {
    return event['Records']
        .filter(r => r.body !== 'error')
        .map(record => {
        const item = JSON.parse(record.body);
        item.messageId = record.messageId;
        item.receiptHandle = record.receiptHandle;
        return item;
    });
};

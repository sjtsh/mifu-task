const AWS = require('aws-sdk');
const eventBridge = new AWS.EventBridge();

exports.sendEvents = async function(source, detailType, events, eventBusName = 'default') {
    const putEventParams = {
        Entries: events.map((event) => ({
            Source: source,
            DetailType: detailType,
            Detail: JSON.stringify(event),
            EventBusName: eventBusName,
        })),
    };
    console.log(putEventParams);
    try {
        const data = await eventBridge.putEvents(putEventParams).promise();

        if (data.FailedEntryCount !== 0) {
            return {
                failed: true,
                error: data
            };
        }

        return {
            failed: false
        };
    } catch (err) {
        console.log('Failed to send events:', err);
        return {
            failed: true,
            error: err
        };
    }
};

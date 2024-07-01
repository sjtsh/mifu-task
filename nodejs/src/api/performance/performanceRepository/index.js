const { ddbClient } = require('/opt/nodejs/utils/db');

class PerformanceRepository {
    async _getPaginatedDataFromScan(params, limit) {
        let result;
        let accumulated = [];
        do {
            result = await ddbClient
                .scan({ ExclusiveStartKey: result?.LastEvaluatedKey, ...params, Limit: 1000 })
                .promise();
            accumulated = [...accumulated, ...result.Items];
            if (accumulated.length >= limit) break;
        } while (result.LastEvaluatedKey);
        return accumulated.slice(0, limit);
    }

    /**
     *
     * @param {string} recTypeLowerBound //in format performance_hourly_{YYYY-MM-DD-HH}
     * @param {string} recTypeUpperBound //in format performance_hourly_{YYYY-MM-DD-HH}
     * @param {Number} limit //number of entries desired
     * @returns {Request<DocumentClient.ScanOutput, AWSError>}
     */
    scanData(recTypeLowerBound, recTypeUpperBound, limit) {
        let filterExpression = '#recType >= :lowerBound';
        if (recTypeUpperBound) {
            filterExpression += ' and #recType <= :upperBound';
        }
        const params = {
            TableName: 'samir_mifu_trial_db',
            FilterExpression: filterExpression,
            ExpressionAttributeValues: {
                ':lowerBound': recTypeLowerBound,
                ':upperBound': recTypeUpperBound,
            },
            ExpressionAttributeNames: {
                '#recType': 'recType',
            },
        };
        return this._getPaginatedDataFromScan(params, limit);
    }
}

exports.performanceRepository = new PerformanceRepository();

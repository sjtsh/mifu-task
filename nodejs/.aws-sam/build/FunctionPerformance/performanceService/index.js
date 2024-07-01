const { performanceRepository } = require('../performanceRepository');

const dateFormat = require('dateformat');
const { PERIOD } = require('../enums');

class PerformanceService {
    /**
     * @param {PERIOD} period //one of the rec types
     * @param {Date} startDate //upper bound in date
     * @param {Date} endDate //lower bound in date
     * @param {Number} limit //lower bound in date
     * @returns {Request<DocumentClient.ScanOutput, AWSError>}
     */
    scanData(period, startDate, endDate, limit) {
        let datePrefix = 'performance_';
        let dtFormat;
        if (period == PERIOD.Hourly) {
            dtFormat = 'yyyy-mm-dd-hh';
            datePrefix += 'hourly_';
        } else if (period == PERIOD.Daily) {
            dtFormat = 'yyyy-mm-dd';
            datePrefix += 'daily_';
        } else if (period == PERIOD.Weekly) {
            dtFormat = 'yyyy-wWW';
            datePrefix += 'weekly_';
        } else if (period == PERIOD.Monthly) {
            dtFormat = 'yyyy-mm';
            datePrefix += 'monthly_';
        }
        let recTypeEndDate;
        const recTypeStartDate = datePrefix + dateFormat(startDate, dtFormat).toUpperCase();
        if (endDate) {
            recTypeEndDate = datePrefix + dateFormat(endDate, dtFormat).toUpperCase();
        }
        return performanceRepository.scanData(recTypeStartDate, recTypeEndDate, limit);
    }
}

exports.performanceService = new PerformanceService();

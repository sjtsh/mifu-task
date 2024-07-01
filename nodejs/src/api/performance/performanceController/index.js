const { performanceService } = require('../performanceService');

const Response = require('/opt/nodejs/utils/response');
const { validatePerformanceQueryRequest } = require('../request-validator');

class PerformanceController {
    scanData(queryParams) {
        return this.withCatch(async () => {
            const errors = await validatePerformanceQueryRequest(queryParams);
            if (errors && errors.length) {
                return Response.error400(errors);
            }
            const { period, startDate, endDate, limit } = queryParams;
            const items = await performanceService.scanData(
                period,
                new Date(startDate),
                endDate ? new Date(endDate) : endDate,
                limit
            );
            return Response.success(items);
        });
    }

    async withCatch(e) {
        try {
            const res = await e();
            return res;
        } catch (e) {
            console.log(JSON.stringify(e), e.stack);
            if (process.env.ENV === 'dev') console.log(JSON.stringify(e));
            return Response.error500('Something went wrong');
        }
    }
}

exports.performanceController = new PerformanceController();

const { object, string, number, date, ref } = require('yup');
const { PERIOD } = require('../enums');

/**
 * todo:
validate end date if limit not specified
 */
exports.validatePerformanceQueryRequest = async request => {
    let validation_schema = object({
        period: string().oneOf(Object.values(PERIOD)),
        startDate: date().max(new Date(), 'cannot use future start date'),
        endDate: date()
            .min(ref('startDate'), 'End date cannot be before start date')
            .max(new Date(), 'cannot use future end date')
            .nullable(),
        limit: number()
            .test('expensive', 'Either end date or limit is required', e => request.endDate || e)
            .nullable()
            .min(0)
            .max(1000),
    });
    return exports.validate(request, validation_schema);
};

exports.validate = async function (requestBody, validationSchema) {
    try {
        const castedValue = validationSchema.cast(requestBody);
        const validationResult = await validationSchema.validate(castedValue, { strict: true });
        return validationResult.errors;
    } catch (err) {
        if (process.env.ENV === 'dev') console.log(JSON.stringify(err));
        return [err.toString().split('\n')[0]];
    }
};
